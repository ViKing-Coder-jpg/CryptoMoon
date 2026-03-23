import yfinance as yf
import httpx


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
    async with httpx.AsyncClient() as client:
        # 24hr ticker stats
        response = await client.get(
            "https://api.binance.com/api/v3/ticker/24hr",
            params={"symbol": "BTCUSDT"}
        )
        data = response.json()

    return {
        "price":              float(data['lastPrice']),
        "change_24h_pct":     float(data['priceChangePercent']),
        "change_24h_usd":     float(data['priceChange']),
        "high_24h":           float(data['highPrice']),
        "low_24h":            float(data['lowPrice']),
        "volume_24h":         float(data['quoteVolume']),  # in USD
    }