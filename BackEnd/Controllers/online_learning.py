"""Online-learning subsystem for the CryptoMoon XGBoost return predictor.

Three operations live here:

1. `append_new_observation()` — pull the most recent closed daily BTC bars from
   yfinance and append them to the on-disk training tape (`Model/data/btc_history.csv`).
   Idempotent: re-running on the same day is a no-op.

2. `incremental_update(n_new_trees=10)` — XGBoost-native warm start. Loads the
   current booster and grows it by `n_new_trees` more trees fit on the most
   recent window of the appended history. Atomic write-then-rename keeps the
   served model file always loadable.

3. `weekly_full_retrain()` — drift safety net. Reruns the full walk-forward
   training pipeline (`Model.train.train_walk_forward`) on the appended history
   so hyperparameters and the tree ensemble are refreshed from scratch.

Versioned snapshots of every produced model land under `Model/versions/`.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from typing import Optional

import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from xgboost import XGBRegressor

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from Controllers.feature_creation import feature_conversion  # noqa: E402
from Controllers.external_signals import (  # noqa: E402
    load_external_signals,
    refresh_external_signals,
)
from Model.train import (  # noqa: E402
    CROSS_ASSET_TICKERS,
    CROSS_ASSETS_CSV_PATH,
    FORECAST_HORIZON_DAYS,
    HISTORY_CSV_PATH,
    METADATA_PATH,
    MODEL_PATH,
    VERSIONS_DIR,
    load_cross_assets,
    save_artifacts,
    train_walk_forward,
)

DEFAULT_INCREMENTAL_WINDOW = 365  # rows fed into the warm-start fit (~1y of daily bars).
                                  # Smaller windows (e.g. 60) combined with the tuned regularization
                                  # produce trees that contribute ~0 to predictions on most inputs —
                                  # ~1y gives the warm-start enough signal to actually move the booster.
DEFAULT_NEW_TREES = 10


# --------------------------------------------------------------------------- #
# 1. Append new daily bars to the training tape
# --------------------------------------------------------------------------- #


def _read_history() -> pd.DataFrame:
    if not os.path.exists(HISTORY_CSV_PATH):
        raise FileNotFoundError(
            f"Training tape missing at {HISTORY_CSV_PATH}. "
            "Seed it once via Model.train.seed_history_csv() (the notebook does this)."
        )
    df = pd.read_csv(HISTORY_CSV_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    df.sort_values("Date", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def _write_history(df: pd.DataFrame) -> None:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"])
    df.sort_values("Date", inplace=True)
    df.drop_duplicates(subset=["Date"], keep="last", inplace=True)
    df.reset_index(drop=True, inplace=True)
    tmp_path = HISTORY_CSV_PATH + ".tmp"
    df.to_csv(tmp_path, index=False)
    os.replace(tmp_path, HISTORY_CSV_PATH)


def _yf_pull(ticker: str, start: str, end: str) -> Optional[pd.DataFrame]:
    """Fetch daily bars; flatten yfinance's MultiIndex columns. Returns None if empty."""
    df = yf.download(ticker, start=start, end=end, interval="1d", progress=False)
    if df is None or len(df) == 0:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns]
    df = df.reset_index()
    if "Date" not in df.columns:
        df = df.rename(columns={df.columns[0]: "Date"})
    df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
    return df


def append_new_observation() -> dict:
    """Fetch any daily BTC bars that landed since the tape's last Date and append them.
    Also refreshes the cross-asset tape (cross_assets.csv) on the same calendar.

    Returns a small report describing what was added (or that nothing was new).
    """
    history = _read_history()
    last_date = history["Date"].max()
    start = (last_date + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    end = (datetime.now(timezone.utc) + pd.Timedelta(days=1)).strftime("%Y-%m-%d")

    btc_appended = 0
    last_date_after = last_date
    if pd.Timestamp(start) < pd.Timestamp(end):
        new = _yf_pull("BTC-USD", start, end)
        if new is not None:
            keep = ["Date", "Open", "High", "Low", "Close", "Volume"]
            new = new[[c for c in keep if c in new.columns]]
            combined = pd.concat([history, new], ignore_index=True)
            _write_history(combined)
            btc_appended = len(new)
            last_date_after = pd.to_datetime(new["Date"]).max()

    cross_report = _refresh_cross_assets(start, end)
    external_report = refresh_external_signals()

    return {
        "btc_appended": int(btc_appended),
        "btc_last_date_before": str(last_date.date()),
        "btc_last_date_after": str(pd.to_datetime(last_date_after).date()),
        "cross_assets": cross_report,
        "external_signals": external_report,
    }


def _refresh_cross_assets(start: str, end: str) -> dict:
    """Append (or seed) cross-asset close prices for the requested date window.
    Each ticker becomes a `<short>_Close` column in cross_assets.csv.
    """
    existing = load_cross_assets()
    appended_per_ticker: dict = {}

    for ticker, short in CROSS_ASSET_TICKERS.items():
        col = f"{short}_Close"
        new = _yf_pull(ticker, start, end)
        if new is None or "Close" not in new.columns:
            appended_per_ticker[short] = 0
            continue
        new_slice = new[["Date", "Close"]].rename(columns={"Close": col})

        if existing is None or len(existing) == 0:
            existing = new_slice.copy()
        else:
            existing["Date"] = pd.to_datetime(existing["Date"])
            if col not in existing.columns:
                existing[col] = np.nan
            merged = existing.merge(new_slice, on="Date", how="outer", suffixes=("", "_new"))
            new_col = f"{col}_new"
            if new_col in merged.columns:
                merged[col] = merged[new_col].combine_first(merged[col])
                merged.drop(columns=[new_col], inplace=True)
            existing = merged
        appended_per_ticker[short] = int(len(new_slice))

    if existing is not None and len(existing):
        existing["Date"] = pd.to_datetime(existing["Date"])
        existing.sort_values("Date", inplace=True)
        existing.drop_duplicates(subset=["Date"], keep="last", inplace=True)
        existing.reset_index(drop=True, inplace=True)
        os.makedirs(os.path.dirname(CROSS_ASSETS_CSV_PATH), exist_ok=True)
        tmp = CROSS_ASSETS_CSV_PATH + ".tmp"
        existing.to_csv(tmp, index=False)
        os.replace(tmp, CROSS_ASSETS_CSV_PATH)

    return appended_per_ticker


def seed_cross_assets(start_date: str, end_date: str) -> dict:
    """One-shot pull of the full cross-asset history. Call from the notebook
    once after seed_history_csv() so training has cross-asset features available.
    """
    return _refresh_cross_assets(start_date, end_date)


# --------------------------------------------------------------------------- #
# 2. Incremental warm-start update of the existing booster
# --------------------------------------------------------------------------- #


def _load_metadata() -> dict:
    if not os.path.exists(METADATA_PATH):
        return {}
    with open(METADATA_PATH) as fh:
        return json.load(fh)


def _save_metadata(metadata: dict) -> None:
    tmp = METADATA_PATH + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(metadata, fh, indent=2)
    os.replace(tmp, METADATA_PATH)


def _atomic_save_model(model: XGBRegressor) -> str:
    """Atomically replace the live model file and write a versioned snapshot.
    Returns the versioned snapshot path.
    """
    os.makedirs(VERSIONS_DIR, exist_ok=True)
    tmp = MODEL_PATH + ".tmp"
    joblib.dump(model, tmp)
    os.replace(tmp, MODEL_PATH)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    version_path = os.path.join(VERSIONS_DIR, f"xgb_{timestamp}.joblib")
    joblib.dump(model, version_path)
    return version_path


def _build_recent_window(history_df: pd.DataFrame, window: int) -> tuple[pd.DataFrame, pd.Series]:
    """Build (X, y) on the trailing `window` feature rows. Used for warm-start fit.
    Mirrors `Model.train._build_feature_frame` so the warm-start trees see the
    same features and the same H-day forward target.
    """
    feat = feature_conversion(
        history_df,
        cross_assets=load_cross_assets(),
        external_signals=load_external_signals(),
    )
    feat["Target"] = (feat["Close"].shift(-FORECAST_HORIZON_DAYS) / feat["Close"]) - 1.0
    feat.drop(columns=["Date", "Close"], inplace=True, errors="ignore")
    feat.dropna(inplace=True)
    feat.reset_index(drop=True, inplace=True)

    if len(feat) < window:
        window = len(feat)
    tail = feat.tail(window).copy()
    y = tail["Target"]
    X = tail.drop(columns=["Target"])

    feature_names = _load_feature_names()
    if feature_names:
        X = X[feature_names]
    return X, y


def _load_feature_names() -> list:
    from Model.train import FEATURES_PATH

    if os.path.exists(FEATURES_PATH):
        return joblib.load(FEATURES_PATH)
    return []


def incremental_update(
    n_new_trees: int = DEFAULT_NEW_TREES,
    window: int = DEFAULT_INCREMENTAL_WINDOW,
) -> dict:
    """Grow the existing booster by `n_new_trees` trees, fit on the trailing `window`.

    Uses XGBoost's `xgb_model=` warm-start, the canonical online-update path:
    new trees are appended to the existing ensemble rather than retraining from
    scratch. Hyperparameters are reused from `model_metadata.json` so the new
    trees are consistent with the old ones (depth/learning-rate/regularization).
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"No production model at {MODEL_PATH}; run a full retrain first.")

    history = _read_history()
    X, y = _build_recent_window(history, window=window)
    if len(X) == 0:
        return {"updated": False, "reason": "no rows available after feature engineering"}

    existing = joblib.load(MODEL_PATH)
    booster = existing.get_booster()

    metadata = _load_metadata()
    base_params = dict(metadata.get("hyperparameters") or {})
    # Strip params that don't apply to a warm-start fit
    base_params.pop("early_stopping_rounds", None)
    base_params["n_estimators"] = int(n_new_trees)

    new_model = XGBRegressor(**base_params)
    new_model.fit(X, y, xgb_model=booster)

    version_path = _atomic_save_model(new_model)

    metadata.update(
        {
            "trained_through": str(pd.to_datetime(history["Date"]).max().date()),
            "saved_at_utc": datetime.now(timezone.utc).isoformat(),
            "version_path": version_path,
            "last_update_kind": "incremental",
            "last_update_trees_added": int(n_new_trees),
            "last_update_window": int(len(X)),
        }
    )
    _save_metadata(metadata)

    return {
        "updated": True,
        "kind": "incremental",
        "trees_added": int(n_new_trees),
        "window_rows": int(len(X)),
        "trained_through": metadata["trained_through"],
        "version_path": version_path,
    }


# --------------------------------------------------------------------------- #
# 3. Full walk-forward retrain from scratch (drift safety)
# --------------------------------------------------------------------------- #


def weekly_full_retrain() -> dict:
    """Re-run the entire walk-forward + RandomizedSearchCV pipeline on the
    appended history. Replaces hyperparameters and the booster wholesale.
    """
    history = _read_history()
    result = train_walk_forward(history)
    paths = save_artifacts(result)
    return {
        "updated": True,
        "kind": "full_retrain",
        "trained_through": result.trained_through,
        "n_train_rows": result.n_train_rows,
        "best_params": result.best_params,
        "tuned_summary": result.extras.get("tuned_summary", {}),
        "version_path": paths["version"],
    }


# --------------------------------------------------------------------------- #
# CLI: `python -m Controllers.online_learning {incremental|full|append}`
# --------------------------------------------------------------------------- #


def _main(argv: list) -> None:
    cmd = argv[1] if len(argv) > 1 else "incremental"
    if cmd == "append":
        print(json.dumps(append_new_observation(), indent=2, default=str))
    elif cmd == "incremental":
        appended = append_new_observation()
        print(json.dumps(appended, indent=2, default=str))
        print(json.dumps(incremental_update(), indent=2, default=str))
    elif cmd == "full":
        appended = append_new_observation()
        print(json.dumps(appended, indent=2, default=str))
        print(json.dumps(weekly_full_retrain(), indent=2, default=str))
    else:
        raise SystemExit(f"unknown command {cmd!r}; expected one of: append, incremental, full")


if __name__ == "__main__":
    _main(sys.argv)
