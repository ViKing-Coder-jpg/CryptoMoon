"""LSTM regressor for the same 5-day forward return target the XGBoost model
uses. Sits alongside `train.py` (the XGBoost source of truth) so the notebook
and `Controllers.useModel.predict_lstm` share one implementation.

Design choices (locked in via the planning step):
  - PyTorch on CPU (no CUDA on darwin; small enough that GPU is overkill anyway)
  - 30-day input sequence -> next 5-day cumulative return (matches XGB target)
  - 2-layer LSTM, hidden=64, dropout=0.2, ~50k parameters
  - StandardScaler fit on the training fold only (no leakage)
  - Early stopping on a 10% chronological val split
  - Walk-forward eval mirrors `Model.train._walk_forward_eval` so notebook
    side-by-side comparison tables share columns
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

# macOS+Python LSTM training segfaults on PyTorch 2.11 when libomp/libiomp are
# both loaded (sklearn brings one, torch brings the other). The official
# workaround is to tell OpenMP to tolerate the duplicate. Set BEFORE torch
# is imported so it takes effect.
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler

# Re-use the XGB module's path constants and direction-metric helpers so the
# two trainers stay in lockstep.
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from Model.train import (  # noqa: E402
    ADAPTIVE_QUANTILE,
    DIRECTION_SCORE_WEIGHT,
    DIRECTION_THRESHOLD,
    FORECAST_HORIZON_DAYS,
    MODEL_DIR,
    PURGE_GAP,
    SHARPE_SCORE_WEIGHT,
    VERSIONS_DIR,
    _direction_aware_score,
    _direction_metrics,
)

LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "LSTM_model.joblib")
LSTM_METADATA_PATH = os.path.join(MODEL_DIR, "LSTM_metadata.json")

DEFAULT_SEQ_LEN = 30
DEFAULT_HIDDEN = 64
DEFAULT_LAYERS = 2
DEFAULT_DROPOUT = 0.2
DEFAULT_EPOCHS = 60
DEFAULT_BATCH_SIZE = 64
DEFAULT_LR = 1e-3
DEFAULT_PATIENCE = 8
DEFAULT_VAL_FRACTION = 0.1


# --------------------------------------------------------------------------- #
# Model
# --------------------------------------------------------------------------- #


class LSTMRegressor(nn.Module):
    """Stacked LSTM -> last-step hidden -> linear scalar. Tiny by ML standards
    (~50k params with the defaults). The point isn't capacity, it's giving
    the comparison-vs-XGB cell something honest to plot.
    """

    def __init__(
        self,
        n_features: int,
        hidden_size: int = DEFAULT_HIDDEN,
        num_layers: int = DEFAULT_LAYERS,
        dropout: float = DEFAULT_DROPOUT,
    ) -> None:
        super().__init__()
        self.n_features = n_features
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.dropout = dropout
        self.lstm = nn.LSTM(
            input_size=n_features,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True,
        )
        self.head = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:    # x: (B, T, F)
        out, _ = self.lstm(x)
        last = out[:, -1, :]                                # (B, hidden)
        return self.head(last).squeeze(-1)                  # (B,)


# --------------------------------------------------------------------------- #
# Sequence building + training utilities
# --------------------------------------------------------------------------- #


def build_sequences(X: np.ndarray, y: np.ndarray, seq_len: int) -> tuple[np.ndarray, np.ndarray]:
    """Sliding window: X (N,F), y (N,) -> X_seq (N - seq_len + 1, seq_len, F), y_seq (...,).
    The label of the i-th sequence is `y[i + seq_len - 1]` -- the row at the END of the window.
    """
    if len(X) < seq_len:
        return np.empty((0, seq_len, X.shape[1])), np.empty((0,))
    n_seq = len(X) - seq_len + 1
    X_seq = np.lib.stride_tricks.sliding_window_view(X, window_shape=seq_len, axis=0)
    # sliding_window_view returns (N - seq_len + 1, F, seq_len); transpose to (..., seq_len, F)
    X_seq = X_seq.transpose(0, 2, 1).copy()
    y_seq = y[seq_len - 1 :]
    return X_seq, y_seq


@dataclass
class LSTMArtifact:
    """Everything inference needs in one pickle. The PyTorch state_dict travels
    inside the joblib payload (joblib handles tensors via the standard pickle
    protocol)."""
    state_dict: dict
    scaler: StandardScaler
    feature_names: list
    seq_len: int
    n_features: int
    hidden_size: int
    num_layers: int
    dropout: float
    horizon_days: int
    trained_through: str
    train_metrics: dict = field(default_factory=dict)


def _make_model_from_artifact(artifact: LSTMArtifact) -> LSTMRegressor:
    model = LSTMRegressor(
        n_features=artifact.n_features,
        hidden_size=artifact.hidden_size,
        num_layers=artifact.num_layers,
        dropout=artifact.dropout,
    )
    model.load_state_dict(artifact.state_dict)
    model.eval()
    return model


# --------------------------------------------------------------------------- #
# Training
# --------------------------------------------------------------------------- #


def _train_one_split(
    X_tr: np.ndarray,
    y_tr: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    *,
    seq_len: int,
    hidden_size: int,
    num_layers: int,
    dropout: float,
    n_epochs: int,
    batch_size: int,
    lr: float,
    patience: int,
    verbose: bool = False,
) -> tuple[LSTMRegressor, list[float], list[float]]:
    """Train an LSTM on (X_tr, y_tr) with early stopping on (X_val, y_val).
    X_tr/X_val are scaled feature matrices; sequences are built inside.
    """
    n_features = X_tr.shape[1]
    Xs_tr, ys_tr = build_sequences(X_tr, y_tr, seq_len)
    Xs_val, ys_val = build_sequences(X_val, y_val, seq_len)

    model = LSTMRegressor(n_features, hidden_size, num_layers, dropout)
    optim = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.HuberLoss(delta=0.05)   # robust to fat-tailed return outliers

    Xt = torch.from_numpy(Xs_tr).float()
    yt = torch.from_numpy(ys_tr).float()
    Xv = torch.from_numpy(Xs_val).float() if len(Xs_val) else None
    yv = torch.from_numpy(ys_val).float() if len(Xs_val) else None

    best_val = float("inf")
    best_state: Optional[dict] = None
    epochs_since_improve = 0
    train_losses: list[float] = []
    val_losses: list[float] = []

    n_train = len(Xt)
    for epoch in range(n_epochs):
        model.train()
        perm = torch.randperm(n_train)
        running = 0.0
        n_batches = 0
        for start in range(0, n_train, batch_size):
            idx = perm[start : start + batch_size]
            optim.zero_grad()
            pred = model(Xt[idx])
            loss = loss_fn(pred, yt[idx])
            loss.backward()
            optim.step()
            running += float(loss.item())
            n_batches += 1
        train_losses.append(running / max(1, n_batches))

        if Xv is not None and len(Xv):
            model.eval()
            with torch.no_grad():
                vloss = float(loss_fn(model(Xv), yv).item())
            val_losses.append(vloss)
            if vloss < best_val - 1e-6:
                best_val = vloss
                best_state = {k: v.clone() for k, v in model.state_dict().items()}
                epochs_since_improve = 0
            else:
                epochs_since_improve += 1
            if verbose and (epoch % 5 == 0 or epoch == n_epochs - 1):
                print(f"  epoch {epoch:>3d}  train={train_losses[-1]:.5f}  val={vloss:.5f}", flush=True)
            if epochs_since_improve >= patience:
                if verbose:
                    print(f"  early stop @ epoch {epoch}", flush=True)
                break
        else:
            val_losses.append(float("nan"))

    if best_state is not None:
        model.load_state_dict(best_state)
    model.eval()
    return model, train_losses, val_losses


def train_lstm(
    X: pd.DataFrame,
    y: pd.Series,
    *,
    seq_len: int = DEFAULT_SEQ_LEN,
    hidden_size: int = DEFAULT_HIDDEN,
    num_layers: int = DEFAULT_LAYERS,
    dropout: float = DEFAULT_DROPOUT,
    n_epochs: int = DEFAULT_EPOCHS,
    batch_size: int = DEFAULT_BATCH_SIZE,
    lr: float = DEFAULT_LR,
    patience: int = DEFAULT_PATIENCE,
    val_fraction: float = DEFAULT_VAL_FRACTION,
    trained_through: str = "",
    verbose: bool = False,
) -> tuple[LSTMArtifact, list[float], list[float]]:
    """Train the production LSTM on ALL of (X, y), with the trailing
    `val_fraction` reserved chronologically for early stopping.
    """
    feature_names = list(X.columns)
    X_arr = X.to_numpy(dtype=np.float32)
    y_arr = y.to_numpy(dtype=np.float32)

    n_holdout = max(seq_len + 5, int(len(X_arr) * val_fraction))
    X_tr_raw, X_val_raw = X_arr[:-n_holdout], X_arr[-n_holdout:]
    y_tr,     y_val     = y_arr[:-n_holdout], y_arr[-n_holdout:]

    scaler = StandardScaler().fit(X_tr_raw)
    X_tr = scaler.transform(X_tr_raw).astype(np.float32)
    X_val = scaler.transform(X_val_raw).astype(np.float32)

    model, train_losses, val_losses = _train_one_split(
        X_tr, y_tr, X_val, y_val,
        seq_len=seq_len, hidden_size=hidden_size, num_layers=num_layers, dropout=dropout,
        n_epochs=n_epochs, batch_size=batch_size, lr=lr, patience=patience, verbose=verbose,
    )

    metrics = {
        "final_train_loss": train_losses[-1] if train_losses else None,
        "best_val_loss": min(val_losses) if val_losses else None,
        "epochs_run": len(train_losses),
        "n_train_sequences": int(max(0, len(X_tr) - seq_len + 1)),
        "n_val_sequences": int(max(0, len(X_val) - seq_len + 1)),
    }

    artifact = LSTMArtifact(
        state_dict={k: v.detach().cpu() for k, v in model.state_dict().items()},
        scaler=scaler,
        feature_names=feature_names,
        seq_len=seq_len,
        n_features=X_arr.shape[1],
        hidden_size=hidden_size,
        num_layers=num_layers,
        dropout=dropout,
        horizon_days=FORECAST_HORIZON_DAYS,
        trained_through=trained_through,
        train_metrics=metrics,
    )
    return artifact, train_losses, val_losses


# --------------------------------------------------------------------------- #
# Walk-forward evaluation (light: 3 folds by default)
# --------------------------------------------------------------------------- #


def walk_forward_eval_lstm(
    X: pd.DataFrame,
    y: pd.Series,
    *,
    n_splits: int = 3,
    seq_len: int = DEFAULT_SEQ_LEN,
    n_epochs: int = DEFAULT_EPOCHS,
    batch_size: int = DEFAULT_BATCH_SIZE,
    lr: float = DEFAULT_LR,
    patience: int = DEFAULT_PATIENCE,
    verbose: bool = True,
) -> pd.DataFrame:
    """Expanding-window walk-forward eval. Same metric columns as
    Model.train._walk_forward_eval so the notebook can concat the two tables.
    """
    from sklearn.model_selection import TimeSeriesSplit

    X_arr_full = X.to_numpy(dtype=np.float32)
    y_arr_full = y.to_numpy(dtype=np.float32)
    splitter = TimeSeriesSplit(n_splits=n_splits)
    rows = []

    for fold, (train_idx, val_idx) in enumerate(splitter.split(X_arr_full), start=1):
        # Honour the same train/val purge gap the XGB pipeline uses.
        if PURGE_GAP and len(train_idx) > PURGE_GAP:
            train_idx = train_idx[: -PURGE_GAP]
        # Need an internal val split for early stopping inside the train slice.
        n_inner_val = max(seq_len + 5, int(len(train_idx) * 0.1))
        inner_train_idx = train_idx[:-n_inner_val]
        inner_val_idx = train_idx[-n_inner_val:]

        scaler = StandardScaler().fit(X_arr_full[inner_train_idx])
        X_tr = scaler.transform(X_arr_full[inner_train_idx]).astype(np.float32)
        X_val_inner = scaler.transform(X_arr_full[inner_val_idx]).astype(np.float32)
        X_test = scaler.transform(X_arr_full[val_idx]).astype(np.float32)

        if verbose:
            print(f"--- fold {fold}/{n_splits}: train={len(inner_train_idx)} val={len(inner_val_idx)} test={len(val_idx)}", flush=True)

        model, _, _ = _train_one_split(
            X_tr, y_arr_full[inner_train_idx], X_val_inner, y_arr_full[inner_val_idx],
            seq_len=seq_len, hidden_size=DEFAULT_HIDDEN, num_layers=DEFAULT_LAYERS,
            dropout=DEFAULT_DROPOUT, n_epochs=n_epochs, batch_size=batch_size,
            lr=lr, patience=patience, verbose=False,
        )

        # Predict on the test fold.
        Xs_test, ys_test = build_sequences(X_test, y_arr_full[val_idx], seq_len)
        if len(Xs_test) == 0:
            continue
        with torch.no_grad():
            y_pred = model(torch.from_numpy(Xs_test).float()).numpy()
        y_true = ys_test

        from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
        rmse = root_mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        dir_acc, dir_acc_filtered, trade_pct = _direction_metrics(y_true, y_pred)
        custom = _direction_aware_score(y_true, y_pred)

        rows.append(
            {
                "fold": fold,
                "train_size": len(inner_train_idx),
                "val_size": len(val_idx),
                "rmse": rmse,
                "mae": mae,
                "r2": r2,
                "dir_acc": dir_acc,
                "dir_acc_filtered": dir_acc_filtered,
                "trade_pct": trade_pct,
                "direction_aware_score": custom,
                "pred_std": float(np.std(y_pred)),
            }
        )
        if verbose:
            print(f"  fold {fold}: rmse={rmse:.4f} dir_acc={dir_acc:.3f} score={custom:.3f}", flush=True)

    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- #
# Inference + serialisation
# --------------------------------------------------------------------------- #


def predict_one(artifact: LSTMArtifact, X_recent: pd.DataFrame) -> float:
    """Predict the next horizon-day forward return given the trailing
    `seq_len` rows of features (in any frame; this slices the tail itself).
    """
    if list(X_recent.columns) != artifact.feature_names:
        # Reorder columns; raise if any are missing.
        missing = [c for c in artifact.feature_names if c not in X_recent.columns]
        if missing:
            raise ValueError(f"X_recent is missing columns: {missing}")
        X_recent = X_recent[artifact.feature_names]
    tail = X_recent.tail(artifact.seq_len)
    if len(tail) < artifact.seq_len:
        raise ValueError(
            f"Need at least {artifact.seq_len} rows of features for inference; got {len(tail)}"
        )
    X = artifact.scaler.transform(tail.to_numpy(dtype=np.float32)).astype(np.float32)
    seq = torch.from_numpy(X).unsqueeze(0)              # (1, seq_len, n_features)
    model = _make_model_from_artifact(artifact)
    with torch.no_grad():
        out = model(seq).item()
    return float(out)


def save_artifact(artifact: LSTMArtifact, *, path: str = LSTM_MODEL_PATH) -> dict:
    """Atomic write-then-rename + a versioned snapshot under Model/versions/.
    Also writes LSTM_metadata.json for human inspection (state_dict isn't dumped there).
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    os.makedirs(VERSIONS_DIR, exist_ok=True)
    tmp = path + ".tmp"
    joblib.dump(artifact, tmp)
    os.replace(tmp, path)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    version_path = os.path.join(VERSIONS_DIR, f"lstm_{timestamp}.joblib")
    joblib.dump(artifact, version_path)

    metadata = {
        "trained_through": artifact.trained_through,
        "horizon_days": artifact.horizon_days,
        "seq_len": artifact.seq_len,
        "n_features": artifact.n_features,
        "hidden_size": artifact.hidden_size,
        "num_layers": artifact.num_layers,
        "dropout": artifact.dropout,
        "feature_names": artifact.feature_names,
        "train_metrics": artifact.train_metrics,
        "saved_at_utc": datetime.now(timezone.utc).isoformat(),
        "version_path": version_path,
    }
    with open(LSTM_METADATA_PATH, "w") as fh:
        json.dump(metadata, fh, indent=2)
    return {"model": path, "version": version_path, "metadata": LSTM_METADATA_PATH}


def load_artifact(path: str = LSTM_MODEL_PATH) -> LSTMArtifact:
    return joblib.load(path)
