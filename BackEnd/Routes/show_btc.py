from fastapi import APIRouter
from Controllers.dashboard import get_candles, get_live_btc

router = APIRouter()

@router.get("/btc-candles")
async def predict_route(period: str = '90d', interval: str = '1d'):
    result = get_candles(period, interval)
    return result

@router.get("/btc-live")
async def live_btc_route():
    result = await get_live_btc()
    return result