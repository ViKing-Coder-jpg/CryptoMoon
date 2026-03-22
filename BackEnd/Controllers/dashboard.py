import yfinance as yf


def get_candles():
    data = yf.download('BTC-USD', period='90d', interval='1d')

    data.columns = [col[0] for col in data.columns]

    candles = []
    for date, row in data.iterrows():
        candles.append({
            "time": date.strftime('%Y-%m-%d'),
            "open":  round(float(row['Open']), 2),
            "high":  round(float(row['High']), 2),
            "low":   round(float(row['Low']), 2),
            "close": round(float(row['Close']), 2),
        })

    return candles