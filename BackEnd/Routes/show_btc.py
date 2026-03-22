from fastapi import APIRouter
from Controllers.dashboard import get_candles

router = APIRouter()

@router.get("/btc-candles")
async def predict_route():
    result = get_candles()
    return result