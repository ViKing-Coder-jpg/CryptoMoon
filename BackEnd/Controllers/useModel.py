import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from Controllers.feature_creation import feature_conversion

xgb_model=joblib.load("Model/XGBoost_model.joblib")
feature_names=joblib.load("Model/feature_names.joblib")


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
        "prediction":float(prediction[0])*100
    }

def predict_lstm(date: str):
    return {"date": date, "model": "lstm", "prediction": None}