import yfinance as yf
import httpx
from fastapi import HTTPException
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET


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


async def get_crypto_news(limit: int = 8):
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Primary: CryptoCompare news feed (no API key required for basic usage)
        try:
            response = await client.get(
                "https://min-api.cryptocompare.com/data/v2/news/",
                params={"lang": "EN"},
            )
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and isinstance(data.get("Data"), list):
                    items = []
                    for item in data["Data"][: max(limit, 1)]:
                        published_on = item.get("published_on")
                        published_at = None
                        if isinstance(published_on, (int, float)):
                            published_at = datetime.fromtimestamp(
                                published_on, tz=timezone.utc
                            ).isoformat()
                        items.append({
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "source": item.get("source"),
                            "published_at": published_at,
                            "image_url": item.get("imageurl"),
                        })
                    return items
        except httpx.HTTPError:
            pass

        async def fetch_rss(url: str, source_name: str):
            try:
                rss_response = await client.get(url)
                if rss_response.status_code != 200:
                    return []
                root = ET.fromstring(rss_response.text)
                items = []
                for item in root.findall(".//item"):
                    title = item.findtext("title")
                    link = item.findtext("link")
                    pub = item.findtext("pubDate")
                    published_at = None
                    if pub:
                        try:
                            dt = parsedate_to_datetime(pub)
                            if dt.tzinfo is None:
                                dt = dt.replace(tzinfo=timezone.utc)
                            published_at = dt.astimezone(timezone.utc).isoformat()
                        except (TypeError, ValueError):
                            published_at = None
                    items.append({
                        "title": title,
                        "url": link,
                        "source": source_name,
                        "published_at": published_at,
                        "image_url": None,
                    })
                    if len(items) >= max(limit, 1):
                        break
                return items
            except (httpx.HTTPError, ET.ParseError):
                return []

        # Fallback: RSS feeds
        coindesk = await fetch_rss("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk")
        cointelegraph = await fetch_rss("https://cointelegraph.com/rss", "Cointelegraph")
        combined = coindesk + cointelegraph

        def sort_key(item):
            return item.get("published_at") or ""

        combined.sort(key=sort_key, reverse=True)
        return combined[: max(limit, 1)]
