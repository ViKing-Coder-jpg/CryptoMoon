import yfinance as yf
import httpx
from fastapi import HTTPException


def get_candles(period='90d', interval='1d'):
    data = yf.download('BTC-USD', period=period, interval=interval)

    data.columns = [col[0] for col in data.columns]

    candles = []
    for date, row in data.iterrows():
        # Lightweight-charts needs Unix integer timestamps for intraday, and 'YYYY-MM-DD' strings for daily
        if 'h' in interval or 'm' in interval:
            time_val = int(date.timestamp())
        else:
            time_val = date.strftime('%Y-%m-%d')

        candles.append({
            "time": time_val,
            "open":  round(float(row['Open']), 2),
            "high":  round(float(row['High']), 2),
            "low":   round(float(row['Low']), 2),
            "close": round(float(row['Close']), 2),
        })

    return candles

async def get_live_btc():
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Primary: Binance 24h ticker stats
        try:
            response = await client.get(
                "https://api.binance.com/api/v3/ticker/24hr",
                params={"symbol": "BTCUSDT"},
            )
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and "lastPrice" in data:
                    return {
                        "price":              float(data["lastPrice"]),
                        "change_24h_pct":     float(data["priceChangePercent"]),
                        "change_24h_usd":     float(data["priceChange"]),
                        "high_24h":           float(data["highPrice"]),
                        "low_24h":            float(data["lowPrice"]),
                        "volume_24h":         float(data["quoteVolume"]),  # in USD
                    }
        except httpx.HTTPError:
            pass

        # Fallback: Coinbase Exchange 24h stats
        try:
            response = await client.get(
                "https://api.exchange.coinbase.com/products/BTC-USD/stats",
            )
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and "last" in data and "open" in data:
                    last = float(data["last"])
                    open_price = float(data["open"])
                    change_usd = last - open_price
                    change_pct = (change_usd / open_price) * 100 if open_price else 0.0
                    volume_base = float(data.get("volume", 0) or 0)
                    return {
                        "price":              last,
                        "change_24h_pct":     change_pct,
                        "change_24h_usd":     change_usd,
                        "high_24h":           float(data["high"]),
                        "low_24h":            float(data["low"]),
                        "volume_24h":         volume_base * last,  # approximate USD
                    }
        except httpx.HTTPError:
            pass

    raise HTTPException(status_code=502, detail="Failed to fetch BTC live price from upstream providers.")
