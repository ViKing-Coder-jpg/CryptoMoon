"""Fetchers for orthogonal market signals: sentiment (Fear & Greed),
on-chain (Blockchain.com daily metrics), and order-flow (Binance perp
funding rates).

All sources are free and do not require an API key. Each fetcher returns a
DataFrame keyed by Date (datetime64, UTC midnight). `seed_external_signals`
and `refresh_external_signals` merge them into Model/data/external_signals.csv,
which both training and inference read via `load_external_signals()`.
"""

from __future__ import annotations

import os
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
import numpy as np
import pandas as pd

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

EXTERNAL_SIGNALS_CSV_PATH = os.path.join(_BACKEND_DIR, "Model", "data", "external_signals.csv")

# Per-source data availability (used for documentation / debugging — not enforced).
SOURCE_HISTORY_START = {
    "fear_greed":      "2018-02-01",
    "blockchain":      "2009-01-03",   # genesis block, but data is sparse pre-2010
    "funding_rate":    "2019-09-08",   # BTCUSDT-PERP launch on Binance Futures
}

_HTTP_TIMEOUT = 30.0
_HTTP_HEADERS = {"User-Agent": "CryptoMoon/1.0 (training pipeline)"}


# --------------------------------------------------------------------------- #
# Fear & Greed Index (alternative.me)
# --------------------------------------------------------------------------- #


def fetch_fear_greed() -> pd.DataFrame:
    """Daily Fear & Greed Index value (0-100). One row per day, since 2018-02-01."""
    url = "https://api.alternative.me/fng/?limit=0&format=json"
    resp = httpx.get(url, timeout=_HTTP_TIMEOUT, headers=_HTTP_HEADERS)
    resp.raise_for_status()
    payload = resp.json()
    data = payload.get("data", [])
    rows = [
        {
            "Date": pd.to_datetime(int(rec["timestamp"]), unit="s"),
            "fng_value": float(rec["value"]),
        }
        for rec in data
    ]
    df = pd.DataFrame(rows)
    df = df.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").reset_index(drop=True)
    return df


# --------------------------------------------------------------------------- #
# Blockchain.com daily on-chain metrics
# --------------------------------------------------------------------------- #


_BLOCKCHAIN_CHARTS = {
    "hash_rate":     "hash-rate",
    "tx_count":      "n-transactions",
    "mempool_size":  "mempool-size",
    "avg_fee":       "transaction-fees",
}


def _fetch_blockchain_chart(chart: str) -> pd.DataFrame:
    url = f"https://api.blockchain.info/charts/{chart}?timespan=all&format=json"
    resp = httpx.get(url, timeout=_HTTP_TIMEOUT, headers=_HTTP_HEADERS)
    resp.raise_for_status()
    values = resp.json().get("values", [])
    return pd.DataFrame(
        [{"Date": pd.to_datetime(int(v["x"]), unit="s"), "value": float(v["y"])} for v in values]
    )


def fetch_blockchain_metrics() -> pd.DataFrame:
    """Merge all daily Blockchain.com metrics into a single DataFrame keyed by Date."""
    out: Optional[pd.DataFrame] = None
    for col, chart in _BLOCKCHAIN_CHARTS.items():
        df = _fetch_blockchain_chart(chart).rename(columns={"value": col})
        out = df if out is None else out.merge(df, on="Date", how="outer")
    if out is None:
        return pd.DataFrame(columns=["Date"] + list(_BLOCKCHAIN_CHARTS.keys()))
    return out.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Binance perp funding rates (paginated)
# --------------------------------------------------------------------------- #


def _fetch_funding_page(start_ms: int, end_ms: int) -> list:
    url = (
        "https://fapi.binance.com/fapi/v1/fundingRate"
        f"?symbol=BTCUSDT&startTime={start_ms}&endTime={end_ms}&limit=1000"
    )
    resp = httpx.get(url, timeout=_HTTP_TIMEOUT, headers=_HTTP_HEADERS)
    resp.raise_for_status()
    return resp.json()


def fetch_funding_rates(start: str = "2019-09-08", end: Optional[str] = None) -> pd.DataFrame:
    """Daily mean funding rate for BTCUSDT-PERP. Funding settles every 8h on
    Binance, so we average the three intra-day readings into a single number.
    Pages backwards through Binance's 1000-record limit.
    """
    if end is None:
        end_dt = datetime.now(timezone.utc)
    else:
        end_dt = datetime.strptime(end, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    start_dt = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    page_span = timedelta(days=300)   # ~900 records per page, comfortably under the 1000 cap
    all_records: list = []
    cursor = start_dt
    while cursor < end_dt:
        page_end = min(cursor + page_span, end_dt)
        records = _fetch_funding_page(int(cursor.timestamp() * 1000), int(page_end.timestamp() * 1000))
        if not records:
            cursor = page_end + timedelta(seconds=1)
            continue
        all_records.extend(records)
        # Walk forward by exactly the time of the last record received to avoid skips/duplicates.
        last_ts = max(r["fundingTime"] for r in records)
        next_cursor = datetime.fromtimestamp(last_ts / 1000, tz=timezone.utc) + timedelta(seconds=1)
        cursor = max(next_cursor, cursor + timedelta(minutes=1))
        time.sleep(0.15)              # gentle on the public endpoint

    if not all_records:
        return pd.DataFrame(columns=["Date", "funding_rate"])

    df = pd.DataFrame(all_records)
    df["Date"] = pd.to_datetime(df["fundingTime"], unit="ms").dt.normalize()
    df["funding_rate"] = df["fundingRate"].astype(float)
    daily = df.groupby("Date", as_index=False)["funding_rate"].mean()
    return daily.sort_values("Date").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Aggregate: build / refresh the unified external_signals.csv
# --------------------------------------------------------------------------- #


def _merge_external(*frames: pd.DataFrame) -> pd.DataFrame:
    """Outer-join a list of Date-keyed frames into one wide table."""
    out: Optional[pd.DataFrame] = None
    for f in frames:
        if f is None or len(f) == 0:
            continue
        f = f.copy()
        f["Date"] = pd.to_datetime(f["Date"]).dt.tz_localize(None).dt.normalize()
        out = f if out is None else out.merge(f, on="Date", how="outer")
    if out is None:
        return pd.DataFrame()
    return out.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").reset_index(drop=True)


def load_external_signals() -> Optional[pd.DataFrame]:
    """Read the cached external-signals tape, or None if it isn't seeded yet.
    Feature engineering tolerates None (zero-fills the affected columns)."""
    if not os.path.exists(EXTERNAL_SIGNALS_CSV_PATH):
        return None
    df = pd.read_csv(EXTERNAL_SIGNALS_CSV_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    return df


def seed_external_signals() -> dict:
    """One-shot full pull of every source. Writes Model/data/external_signals.csv.
    Safe to re-run -- subsequent calls just refresh the file with newer data."""
    fng = fetch_fear_greed()
    chain = fetch_blockchain_metrics()
    funding = fetch_funding_rates()

    merged = _merge_external(fng, chain, funding)
    os.makedirs(os.path.dirname(EXTERNAL_SIGNALS_CSV_PATH), exist_ok=True)
    tmp = EXTERNAL_SIGNALS_CSV_PATH + ".tmp"
    merged.to_csv(tmp, index=False)
    os.replace(tmp, EXTERNAL_SIGNALS_CSV_PATH)

    return {
        "fng_rows": int(len(fng)),
        "blockchain_rows": int(len(chain)),
        "funding_rows": int(len(funding)),
        "merged_rows": int(len(merged)),
        "first_date": str(merged["Date"].min().date()) if len(merged) else None,
        "last_date": str(merged["Date"].max().date()) if len(merged) else None,
        "path": EXTERNAL_SIGNALS_CSV_PATH,
    }


def refresh_external_signals() -> dict:
    """Top up the existing tape with whatever is newer than its current last_date.
    For F&G and on-chain we re-fetch full history (cheap, ~150ms each); for
    funding rates we only fetch from `last_date - 2 days` forward so we don't
    re-paginate years of records on every update.
    """
    existing = load_external_signals()

    fng = fetch_fear_greed()
    chain = fetch_blockchain_metrics()

    if existing is not None and "funding_rate" in existing.columns:
        last_funding = existing.dropna(subset=["funding_rate"])["Date"].max()
        funding_start = (pd.to_datetime(last_funding) - pd.Timedelta(days=2)).strftime("%Y-%m-%d")
    else:
        funding_start = "2019-09-08"
    funding = fetch_funding_rates(start=funding_start)

    new = _merge_external(fng, chain, funding)
    merged = _merge_external(existing, new) if existing is not None else new

    tmp = EXTERNAL_SIGNALS_CSV_PATH + ".tmp"
    merged.to_csv(tmp, index=False)
    os.replace(tmp, EXTERNAL_SIGNALS_CSV_PATH)

    return {
        "fng_rows": int(len(fng)),
        "blockchain_rows": int(len(chain)),
        "funding_rows": int(len(funding)),
        "merged_rows": int(len(merged)),
        "last_date": str(merged["Date"].max().date()) if len(merged) else None,
    }


# --------------------------------------------------------------------------- #
# CLI: `python -m Controllers.external_signals seed`
# --------------------------------------------------------------------------- #


def _main(argv: list) -> None:
    import json
    cmd = argv[1] if len(argv) > 1 else "seed"
    if cmd == "seed":
        print(json.dumps(seed_external_signals(), indent=2, default=str))
    elif cmd == "refresh":
        print(json.dumps(refresh_external_signals(), indent=2, default=str))
    elif cmd == "show":
        df = load_external_signals()
        if df is None:
            print("no external_signals.csv yet")
            return
        print(df.tail(10).to_string())
    else:
        raise SystemExit(f"unknown command {cmd!r}; expected seed, refresh, or show")


if __name__ == "__main__":
    _main(sys.argv)
