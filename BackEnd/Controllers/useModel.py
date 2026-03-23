import os
import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from Controllers.feature_creation import feature_conversion

# Define paths relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "Model", "XGBoost_model.joblib")
FEATURES_PATH = os.path.join(BASE_DIR, "Model", "feature_names.joblib")

xgb_model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)


def predict_xgb(date: str):
    end_date=datetime.strptime(date,"%Y-%m-%d")
    start_date=end_date-timedelta(days=60)
    btc=yf.download("BTC-USD",start=start_date,end=end_date,interval="1d")
    btc.columns=[col[0] for col in btc.columns]
    btc_df=feature_conversion(btc)
    btc_df=btc_df[feature_names]
    latest=btc_df.iloc[[-1]]
    prediction=xgb_model.predict(latest)
    return {
        "date":date,
        "model":"xgb",
        "prediction_return":float(prediction[0])*100,
        "prediction_price":(1+float(prediction[0]))*btc["Close"].iloc[-1]
        
    }

def predict_lstm(date: str):
    return {"date": date, "model": "lstm", "prediction": None}