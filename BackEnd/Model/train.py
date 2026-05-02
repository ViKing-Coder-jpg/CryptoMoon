"""Walk-forward training pipeline for the CryptoMoon XGBoost return predictor.

Reusable from both the training notebook (`CryptoMoon.ipynb`) and the production
online-learning subsystem (`Controllers.online_learning.weekly_full_retrain`).
The single source of truth for feature engineering is
`Controllers.feature_creation.feature_conversion` -- this module only owns the
target definition, validation methodology, hyperparameter search, and artifact
persistence.

Target: next-day percentage return = `Returns.shift(-1)`.
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit
from xgboost import XGBRegressor

# Make `Controllers.feature_creation` importable whether train.py is run as a
# script (`python BackEnd/Model/train.py`) or as a module from the BackEnd cwd.
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from Controllers.feature_creation import feature_conversion  # noqa: E402

MODEL_DIR = os.path.join(_BACKEND_DIR, "Model")
DATA_DIR = os.path.join(MODEL_DIR, "data")
VERSIONS_DIR = os.path.join(MODEL_DIR, "versions")

MODEL_PATH = os.path.join(MODEL_DIR, "XGBoost_model.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_names.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")
WALKFWD_METRICS_PATH = os.path.join(MODEL_DIR, "walk_forward_metrics.csv")
HISTORY_CSV_PATH = os.path.join(DATA_DIR, "btc_history.csv")
CROSS_ASSETS_CSV_PATH = os.path.join(DATA_DIR, "cross_assets.csv")

# (ticker -> short name used in cross_assets.csv columns and feature names).
# Must stay in sync with Controllers.feature_creation.CROSS_ASSETS.
CROSS_ASSET_TICKERS: dict = {
    "ETH-USD": "ETH",
    "SPY":     "SPY",
    "UUP":     "DXY",
    "GLD":     "GOLD",
}

FORECAST_HORIZON_DAYS = 5            # target = (Close[t+H] / Close[t]) - 1
DIRECTION_THRESHOLD = 0.02           # ~2% over 5 days; rough analogue of the old 0.8% over 1 day
ADAPTIVE_QUANTILE = 0.75             # per-fold trade filter: |y_pred| above this quantile -> take a position
DIRECTION_SCORE_WEIGHT = 0.7         # weight on filtered direction accuracy in the custom scorer
SHARPE_SCORE_WEIGHT = 0.3            # weight on normalised Sharpe in the custom scorer
SAMPLE_WEIGHT_LAMBDA = 0.999         # exponential decay on training-row recency (half-life ~ 693 days)
PURGE_GAP = FORECAST_HORIZON_DAYS    # rows to drop at the train/val boundary -- the H-day target
                                     # leaks H rows into the val set, so purge that many.

DEFAULT_PARAMS: dict = {
    "n_estimators": 1000,
    "learning_rate": 0.02,
    "max_depth": 3,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "objective": "reg:pseudohubererror",
}

# Wider search space: deeper trees and lower learning rates are now allowed so
# the optimiser is not boxed into the predict-the-mean corner of the original
# narrow grid. Combined with the direction-aware scorer below, this lets the
# search reward models that actually take positions instead of hugging zero.
SEARCH_SPACE: dict = {
    "n_estimators":     [400, 800, 1200, 1600, 2000],
    "max_depth":        [2, 3, 4, 5, 6, 8],
    "learning_rate":    [0.005, 0.01, 0.02, 0.05, 0.08],
    "subsample":        [0.5, 0.6, 0.8, 1.0],
    "colsample_bytree": [0.5, 0.6, 0.8, 1.0],
    "min_child_weight": [1, 3, 5, 10],
    "reg_alpha":        [0.0, 0.1, 1.0, 5.0],
    "reg_lambda":       [0.5, 1.0, 3.0, 10.0],
}


@dataclass
class TrainResult:
    model: XGBRegressor
    feature_names: list
    fold_metrics: pd.DataFrame
    baseline_fold_metrics: pd.DataFrame
    best_params: dict
    trained_through: str
    n_train_rows: int
    extras: dict = field(default_factory=dict)


def load_cross_assets() -> Optional[pd.DataFrame]:
    """Read the cached cross-asset OHLCV tape, or None if it isn't seeded yet.
    Feature engineering tolerates None/missing columns (zero-fills), so callers
    don't need to guard the return value.
    """
    if not os.path.exists(CROSS_ASSETS_CSV_PATH):
        return None
    df = pd.read_csv(CROSS_ASSETS_CSV_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    return df


def _build_feature_frame(
    history_df: pd.DataFrame,
    cross_assets: Optional[pd.DataFrame] = None,
    external_signals: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Turn raw OHLCV into the model's feature matrix + Target column.

    Target = `H`-day cumulative forward return on Close (Close[t+H]/Close[t] - 1)
    where H = FORECAST_HORIZON_DAYS. The Close column is preserved by
    feature_conversion specifically so this can be computed cleanly and then
    dropped before training.
    """
    df = history_df.copy()
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])
        df.sort_values("Date", inplace=True)
        df.reset_index(drop=True, inplace=True)

    if cross_assets is None:
        cross_assets = load_cross_assets()
    if external_signals is None:
        # Lazy import keeps Controllers.* free of train.py module dependencies.
        from Controllers.external_signals import load_external_signals
        external_signals = load_external_signals()

    feat = feature_conversion(df, cross_assets=cross_assets, external_signals=external_signals)

    # H-day forward cumulative return on Close.
    feat["Target"] = (feat["Close"].shift(-FORECAST_HORIZON_DAYS) / feat["Close"]) - 1.0

    feat.drop(columns=["Date", "Close"], inplace=True, errors="ignore")
    feat.dropna(inplace=True)
    feat.reset_index(drop=True, inplace=True)
    return feat


def _direction_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> tuple[float, float, float]:
    """Direction accuracy (all rows), trade-filtered direction accuracy, and trade %.
    Trade filter mirrors the notebook's `threshold = 0.008` rule -- kept for
    backwards-comparable fold reporting alongside the new adaptive scorer.
    """
    dir_acc = float(np.mean((y_pred > 0) == (y_true > 0))) if len(y_true) else float("nan")
    mask = np.abs(y_pred) > DIRECTION_THRESHOLD
    if mask.sum():
        filtered = float(np.mean((y_pred[mask] > 0) == (y_true[mask] > 0)))
    else:
        filtered = float("nan")
    return dir_acc, filtered, float(mask.mean())


# --------------------------------------------------------------------------- #
# Purged TimeSeriesSplit + direction-aware scorer + sample weights.
# --------------------------------------------------------------------------- #


class PurgedTimeSeriesSplit:
    """`TimeSeriesSplit` variant that leaves a `gap` rows of dead space between
    train and val. We need this because Target = Returns.shift(-1) means the last
    train row's label is the val set's first row's `Returns` feature -- without
    purging, the search slightly overfits to that overlap.
    """

    def __init__(self, n_splits: int, gap: int = PURGE_GAP):
        self.n_splits = n_splits
        self.gap = gap

    def get_n_splits(self, X=None, y=None, groups=None) -> int:
        return self.n_splits

    def split(self, X, y=None, groups=None):
        for train_idx, val_idx in TimeSeriesSplit(n_splits=self.n_splits).split(X):
            if self.gap and len(train_idx) > self.gap:
                train_idx = train_idx[: -self.gap]
            yield train_idx, val_idx


def _exponential_sample_weights(n: int, lam: float = SAMPLE_WEIGHT_LAMBDA) -> np.ndarray:
    """Recency-decay weights so the model pays more attention to recent regime.
    Index 0 is the oldest row, index n-1 the most recent. Weight at index i is
    `lam ** (n-1-i)`, normalised so weights sum to n (sklearn convention).
    """
    if n == 0:
        return np.zeros(0)
    raw = lam ** np.arange(n - 1, -1, -1, dtype=float)
    return raw * (n / raw.sum())


def _direction_aware_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Custom score (higher is better). Combines:
      - filtered direction accuracy: of the predictions whose magnitude is in
        the top ADAPTIVE_QUANTILE quantile, what fraction got the sign right
      - normalised Sharpe of the implied long/short strategy on those bars
    Returns -1.0 if every prediction is essentially zero (degenerate model).
    """
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    if len(y_pred) == 0:
        return -1.0

    abs_pred = np.abs(y_pred)
    threshold = float(np.quantile(abs_pred, ADAPTIVE_QUANTILE))
    if threshold <= 0:
        return -1.0
    mask = abs_pred >= threshold
    if mask.sum() < 5:                               # not enough trades to evaluate
        return -1.0

    yp = y_pred[mask]
    yt = y_true[mask]
    filtered_dir_acc = float(np.mean((yp > 0) == (yt > 0)))

    strategy_returns = np.sign(yp) * yt
    if strategy_returns.std() > 0:
        sharpe = strategy_returns.mean() / strategy_returns.std() * np.sqrt(365.0)
    else:
        sharpe = 0.0
    normalised_sharpe = float(np.clip(sharpe / 2.0, -1.0, 1.0))   # sharpe of 2 -> max bonus

    score = (
        DIRECTION_SCORE_WEIGHT * filtered_dir_acc
        + SHARPE_SCORE_WEIGHT * (normalised_sharpe + 1.0) / 2.0
    )
    return float(score)


def _direction_aware_scorer(estimator, X, y) -> float:
    """sklearn-compatible scorer that wraps `_direction_aware_score`."""
    y_pred = estimator.predict(X)
    return _direction_aware_score(np.asarray(y), y_pred)


def _walk_forward_eval(
    X: pd.DataFrame,
    y: pd.Series,
    params: dict,
    n_splits: int,
    use_sample_weights: bool = True,
) -> pd.DataFrame:
    """Expanding-window walk-forward evaluation with given params. One row per fold.
    Uses the purged splitter and recency-weighted training samples.
    """
    splitter = PurgedTimeSeriesSplit(n_splits=n_splits, gap=PURGE_GAP)
    rows = []
    for fold, (train_idx, val_idx) in enumerate(splitter.split(X), start=1):
        model = XGBRegressor(**params)
        sw = _exponential_sample_weights(len(train_idx)) if use_sample_weights else None
        model.fit(X.iloc[train_idx], y.iloc[train_idx], sample_weight=sw)
        y_pred = model.predict(X.iloc[val_idx])
        y_true = y.iloc[val_idx].to_numpy()
        rmse = root_mean_squared_error(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        dir_acc, dir_acc_filtered, trade_pct = _direction_metrics(y_true, y_pred)
        custom = _direction_aware_score(y_true, y_pred)
        rows.append(
            {
                "fold": fold,
                "train_size": len(train_idx),
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
    return pd.DataFrame(rows)


def _summarize(metrics: pd.DataFrame) -> dict:
    return {
        "rmse_mean": float(metrics["rmse"].mean()),
        "rmse_std": float(metrics["rmse"].std()),
        "mae_mean": float(metrics["mae"].mean()),
        "dir_acc_mean": float(metrics["dir_acc"].mean()),
        "dir_acc_filtered_mean": float(metrics["dir_acc_filtered"].mean(skipna=True)),
        "direction_aware_score_mean": float(metrics["direction_aware_score"].mean()),
        "pred_std_mean": float(metrics["pred_std"].mean()),
    }


def _hyperparam_search(
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int,
    n_iter: int,
    random_state: int,
) -> tuple[dict, float]:
    """RandomizedSearchCV with PurgedTimeSeriesSplit + the direction-aware scorer.
    Sample weights (recency decay) are passed via fit_params and sklearn slices
    them per-fold automatically. Returns (best_params, best_score).
    """
    base = XGBRegressor(objective="reg:pseudohubererror", random_state=random_state)
    sample_weight = _exponential_sample_weights(len(X))
    search = RandomizedSearchCV(
        estimator=base,
        param_distributions=SEARCH_SPACE,
        n_iter=n_iter,
        cv=PurgedTimeSeriesSplit(n_splits=n_splits, gap=PURGE_GAP),
        scoring=_direction_aware_scorer,
        n_jobs=-1,
        random_state=random_state,
        verbose=0,
        refit=False,
    )
    search.fit(X, y, sample_weight=sample_weight)
    best = dict(search.best_params_)
    best["objective"] = "reg:pseudohubererror"
    return best, float(search.best_score_)


def _final_fit(X: pd.DataFrame, y: pd.Series, params: dict) -> XGBRegressor:
    """Final production fit on all rows using the chosen hyperparameters,
    with early stopping on the last 10% as a holdout to avoid over-training.
    Recency-weighted sample weights are applied to the training portion.
    """
    holdout = max(1, int(len(X) * 0.1))
    X_tr, X_val = X.iloc[:-holdout], X.iloc[-holdout:]
    y_tr, y_val = y.iloc[:-holdout], y.iloc[-holdout:]
    fit_params = dict(params)
    fit_params.setdefault("early_stopping_rounds", 50)
    model = XGBRegressor(**fit_params)
    sw = _exponential_sample_weights(len(X_tr))
    model.fit(X_tr, y_tr, sample_weight=sw, eval_set=[(X_val, y_val)], verbose=False)
    return model


def train_walk_forward(
    history_df: pd.DataFrame,
    *,
    n_splits_eval: int = 10,
    n_splits_tune: int = 5,
    n_iter: int = 80,
    random_state: int = 42,
    skip_search: bool = False,
) -> TrainResult:
    """Run the full walk-forward training pipeline.

    1. Build features + next-day-return target.
    2. Walk-forward evaluate the existing default hyperparameters (baseline).
    3. RandomizedSearchCV under TimeSeriesSplit to pick new hyperparameters.
    4. Walk-forward evaluate the tuned hyperparameters (post-tune).
    5. Final fit on all rows with early stopping on the last 10% holdout.
    """
    feat = _build_feature_frame(history_df)
    y = feat["Target"]
    X = feat.drop(columns=["Target"])
    feature_names = X.columns.tolist()

    baseline_metrics = _walk_forward_eval(X, y, DEFAULT_PARAMS, n_splits=n_splits_eval)

    if skip_search:
        best_params = dict(DEFAULT_PARAMS)
        best_score = float("nan")
    else:
        best_params, best_score = _hyperparam_search(
            X, y, n_splits=n_splits_tune, n_iter=n_iter, random_state=random_state
        )

    tuned_metrics = _walk_forward_eval(X, y, best_params, n_splits=n_splits_eval)
    final_model = _final_fit(X, y, best_params)

    trained_through = ""
    if "Date" in history_df.columns:
        trained_through = str(pd.to_datetime(history_df["Date"]).max().date())

    return TrainResult(
        model=final_model,
        feature_names=feature_names,
        fold_metrics=tuned_metrics,
        baseline_fold_metrics=baseline_metrics,
        best_params=best_params,
        trained_through=trained_through,
        n_train_rows=len(X),
        extras={
            "search_best_score": best_score,
            "baseline_summary": _summarize(baseline_metrics),
            "tuned_summary": _summarize(tuned_metrics),
        },
    )


def save_artifacts(result: TrainResult, *, model_dir: str = MODEL_DIR) -> dict:
    """Persist the trained model and metadata. Returns a dict of paths written."""
    os.makedirs(model_dir, exist_ok=True)
    os.makedirs(VERSIONS_DIR, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    versioned_path = os.path.join(VERSIONS_DIR, f"xgb_{timestamp}.joblib")

    # Atomic write-then-rename so a half-written file never replaces the live one.
    tmp_path = MODEL_PATH + ".tmp"
    joblib.dump(result.model, tmp_path)
    os.replace(tmp_path, MODEL_PATH)
    joblib.dump(result.model, versioned_path)
    joblib.dump(result.feature_names, FEATURES_PATH)

    metadata = {
        "trained_through": result.trained_through,
        "n_train_rows": result.n_train_rows,
        "hyperparameters": result.best_params,
        "baseline_summary": result.extras.get("baseline_summary", {}),
        "tuned_summary": result.extras.get("tuned_summary", {}),
        "search_best_score": result.extras.get("search_best_score"),
        "feature_names": result.feature_names,
        "saved_at_utc": datetime.now(timezone.utc).isoformat(),
        "version_path": versioned_path,
    }
    with open(METADATA_PATH, "w") as fh:
        json.dump(metadata, fh, indent=2)

    result.fold_metrics.to_csv(WALKFWD_METRICS_PATH, index=False)

    return {
        "model": MODEL_PATH,
        "version": versioned_path,
        "features": FEATURES_PATH,
        "metadata": METADATA_PATH,
        "fold_metrics": WALKFWD_METRICS_PATH,
    }


def load_history_from_kaggle() -> pd.DataFrame:
    """Pull the same Bitcoin OHLCV dataset the notebook uses."""
    import kagglehub

    path = kagglehub.dataset_download("aiwithcagri/bitcoin-12-years-price-january-2026")
    return pd.read_csv(os.path.join(path, "bitcoin (1).csv"))


def seed_history_csv(history_df: pd.DataFrame) -> str:
    """Write the source OHLCV to btc_history.csv so the online-learning loop
    can append new bars to it. Sorted ascending by Date for downstream simplicity.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    df = history_df.copy()
    df["Date"] = pd.to_datetime(df["Date"])
    df.sort_values("Date", inplace=True)
    df.to_csv(HISTORY_CSV_PATH, index=False)
    return HISTORY_CSV_PATH


def _main() -> None:
    print("Loading Bitcoin OHLCV history from Kaggle...", flush=True)
    history = load_history_from_kaggle()
    print(f"  rows={len(history)}, columns={list(history.columns)}", flush=True)

    seed_path = seed_history_csv(history)
    print(f"Seeded BTC tape -> {seed_path}", flush=True)

    # Lazy import to avoid a circular at module load (online_learning imports train).
    from Controllers.online_learning import seed_cross_assets
    from Controllers.external_signals import seed_external_signals

    btc_dates = pd.to_datetime(history["Date"])
    start = btc_dates.min().strftime("%Y-%m-%d")
    end = (btc_dates.max() + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"Seeding cross-asset tape ({start} -> {end})...", flush=True)
    cross_report = seed_cross_assets(start, end)
    print(f"  rows fetched per ticker: {cross_report}", flush=True)

    print("Seeding external-signals tape (Fear&Greed + Blockchain.com + Binance funding)...", flush=True)
    ext_report = seed_external_signals()
    print(f"  external_signals: {ext_report}", flush=True)

    print("Running walk-forward training + RandomizedSearchCV...", flush=True)
    result = train_walk_forward(history)

    paths = save_artifacts(result)
    print("Saved:")
    for k, v in paths.items():
        print(f"  {k}: {v}")

    print("\nBaseline (default params) summary:")
    print(json.dumps(result.extras["baseline_summary"], indent=2))
    print("\nTuned summary:")
    print(json.dumps(result.extras["tuned_summary"], indent=2))
    print("\nBest hyperparameters:")
    print(json.dumps(result.best_params, indent=2))


if __name__ == "__main__":
    _main()
