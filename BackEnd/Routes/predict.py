from fastapi import APIRouter
from Controllers.useModel import predict_xgb, predict_lstm

router = APIRouter()

@router.get("/predict")
async def predict_route(date: str, model_use: str):
    if model_use == "xgb":
        result = predict_xgb(date)
    elif model_use == "lstm":
        result = predict_lstm(date)
    else:
        return {"error": "Invalid model_use. Choose 'xgb' or 'lstm'"}
    
    return result
@router.head('/')
async def func():
    return None