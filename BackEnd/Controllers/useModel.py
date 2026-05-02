import os
import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from Controllers.feature_creation import CROSS_ASSETS, feature_conversion
from Controllers.external_signals import load_external_signals

# Define paths relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "Model", "XGBoost_model.joblib")
FEATURES_PATH = os.path.join(BASE_DIR, "Model", "feature_names.joblib")
CROSS_ASSETS_CSV_PATH = os.path.join(BASE_DIR, "Model", "data", "cross_assets.csv")

# Inference-time download window. The 200-day SMA + 30-row dropna means the
# feature row for `date` needs at least ~250 days of history above it to land
# unmasked. 280 leaves a comfortable buffer for weekends/holidays.
INFERENCE_WINDOW_DAYS = 280

# Forecast horizon: the model's target is the H-day cumulative forward return.
# Surface this in the API response so callers know the prediction window.
FORECAST_HORIZON_DAYS = 5

# mtime-cached loader: the online-learning subsystem (Controllers/online_learning.py)
# rewrites these files in-place after each incremental/full update. Re-reading on every
# request is wasteful, but always returning the import-time copy serves stale predictions.
# Cache the loaded objects keyed by the file mtimes and reload only when they advance.
_model_cache: dict = {"mtime": None, "obj": None}
_features_cache: dict = {"mtime": None, "obj": None}


def _get_model():
    mtime = os.path.getmtime(MODEL_PATH)
    if _model_cache["mtime"] != mtime:
        _model_cache["obj"] = joblib.load(MODEL_PATH)
        _model_cache["mtime"] = mtime
    return _model_cache["obj"]


def _get_feature_names():
    mtime = os.path.getmtime(FEATURES_PATH)
    if _features_cache["mtime"] != mtime:
        _features_cache["obj"] = joblib.load(FEATURES_PATH)
        _features_cache["mtime"] = mtime
    return _features_cache["obj"]


def _load_cross_assets_for_window(start_date: datetime, end_date: datetime) -> pd.DataFrame | None:
    """Slice the cached cross-asset tape to the inference window. Returns None
    if the tape is missing -- feature_conversion handles that by zero-filling
    the cross-asset features so a prediction can still be served."""
    if not os.path.exists(CROSS_ASSETS_CSV_PATH):
        return None
    df = pd.read_csv(CROSS_ASSETS_CSV_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    return df[(df["Date"] >= pd.Timestamp(start_date)) & (df["Date"] <= pd.Timestamp(end_date))]


def predict_xgb(date: str):
    end_date = datetime.strptime(date, "%Y-%m-%d")
    start_date = end_date - timedelta(days=INFERENCE_WINDOW_DAYS)
    btc = yf.download("BTC-USD", start=start_date, end=end_date, interval="1d", progress=False)
    if isinstance(btc.columns, pd.MultiIndex):
        btc.columns = [col[0] for col in btc.columns]

    cross_assets = _load_cross_assets_for_window(start_date, end_date)
    external_signals = load_external_signals()
    btc_df = feature_conversion(btc, cross_assets=cross_assets, external_signals=external_signals)
    btc_df = btc_df[_get_feature_names()]
    latest = btc_df.iloc[[-1]]
    prediction = _get_model().predict(latest)
    pred_return = float(prediction[0])
    return {
        "date": date,
        "model": "xgb",
        "horizon_days": FORECAST_HORIZON_DAYS,
        "prediction_return": pred_return * 100,                         # H-day cumulative return %
        "prediction_price": (1 + pred_return) * btc["Close"].iloc[-1],  # implied price H days from `date`
    }

def predict_lstm(date: str):
    return {"date": date, "model": "lstm", "prediction": None}