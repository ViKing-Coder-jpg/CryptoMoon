import numpy as np
import pandas as pd

# Cross-asset tickers shipped via Model/data/cross_assets.csv. Each lives as a
# `<NAME>_Close` column. The `_return` and `_vol5` features below are derived
# from those columns at feature-build time.
CROSS_ASSETS = {
    "ETH-USD": "ETH",   # crypto co-movement
    "SPY":     "SPY",   # equities risk-on/risk-off
    "UUP":     "DXY",   # USD strength proxy
    "GLD":     "GOLD",  # safe-haven proxy
}


def _normalize_dates(data: pd.DataFrame) -> pd.DataFrame:
    """Return a copy of `data` with a 'Date' column (datetime64) and a clean
    integer index, sorted chronologically. Accepts either kaggle-shape (Date
    as a column) or yfinance-shape (DatetimeIndex)."""
    df = data.copy()
    if "Date" not in df.columns:
        if isinstance(df.index, pd.DatetimeIndex):
            df = df.reset_index()
            if "Date" not in df.columns:
                df = df.rename(columns={df.columns[0]: "Date"})
        else:
            df["Date"] = pd.NaT
    df["Date"] = pd.to_datetime(df["Date"])
    df.sort_values("Date", inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


def _add_cross_asset_features(feat: pd.DataFrame, dates: pd.Series, cross_assets: pd.DataFrame | None) -> None:
    """For each tracked cross-asset, attach a 1d return and a 5d realized-vol column.
    Cross-assets are forward-filled to BTC's calendar (BTC trades 7 days/week, equity
    proxies do not). If `cross_assets` is missing or doesn't include a column for a
    symbol, the corresponding features are zero-filled so the model's input shape
    is preserved -- prevents inference crashes when the cross-asset tape is stale.
    """
    if cross_assets is None or len(cross_assets) == 0:
        for short in CROSS_ASSETS.values():
            feat[f"{short}_return"] = 0.0
            feat[f"{short}_vol5"] = 0.0
        return

    ca = cross_assets.copy()
    ca["Date"] = pd.to_datetime(ca["Date"])
    ca = ca.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").set_index("Date")
    date_index = pd.to_datetime(dates.values)

    for ticker, short in CROSS_ASSETS.items():
        col = f"{short}_Close"
        if col not in ca.columns:
            feat[f"{short}_return"] = 0.0
            feat[f"{short}_vol5"] = 0.0
            continue
        # forward-fill onto the BTC calendar so weekends inherit Friday's close
        close = ca[col].reindex(date_index).ffill()
        ret = close.pct_change()
        # Zero-fill leading NaNs so rows from before this asset existed (e.g. pre-2017
        # ETH-USD bars) survive the dropna() at the end of feature_conversion. The
        # downside is the model treats "asset didn't exist" identically to "0% return",
        # but that's preferable to losing 3 years of BTC training data.
        feat[f"{short}_return"] = ret.fillna(0.0).values
        feat[f"{short}_vol5"] = ret.rolling(5, min_periods=1).std().fillna(0.0).values


def _add_external_signal_features(feat: pd.DataFrame, dates: pd.Series, external_signals: pd.DataFrame | None) -> None:
    """Attach orthogonal market signals: sentiment (Fear & Greed), on-chain
    metrics from Blockchain.com (hash rate / tx count / mempool / avg fee), and
    Binance perp funding rate. All zero-filled for any row predating the
    source's existence (F&G pre-2018, funding pre-2019-09) so we don't lose
    BTC history that has the rest of the features available.
    """
    cols = [
        "fng_value", "fng_zscore_30",
        "hash_rate_pct_change_7", "tx_count_pct_change_7",
        "mempool_size_log", "avg_fee_pct_change_7",
        "funding_rate", "funding_rate_zscore_7",
    ]
    if external_signals is None or len(external_signals) == 0:
        for c in cols:
            feat[c] = 0.0
        return

    es = external_signals.copy()
    es["Date"] = pd.to_datetime(es["Date"])
    es = es.sort_values("Date").drop_duplicates(subset=["Date"], keep="last").set_index("Date")
    date_index = pd.to_datetime(dates.values)

    def _aligned(col: str) -> pd.Series:
        if col not in es.columns:
            return pd.Series(np.nan, index=date_index)
        return es[col].reindex(date_index).ffill()

    fng = _aligned("fng_value") / 100.0       # rescale 0-100 -> 0-1
    feat["fng_value"] = fng.fillna(0.0).values
    fng_mean_30 = fng.rolling(30, min_periods=5).mean()
    fng_std_30 = fng.rolling(30, min_periods=5).std()
    feat["fng_zscore_30"] = ((fng - fng_mean_30) / fng_std_30.replace(0, np.nan)).fillna(0.0).values

    hash_rate = _aligned("hash_rate")
    feat["hash_rate_pct_change_7"] = hash_rate.pct_change(7).fillna(0.0).values

    tx_count = _aligned("tx_count")
    feat["tx_count_pct_change_7"] = tx_count.pct_change(7).fillna(0.0).values

    mempool = _aligned("mempool_size")
    # log1p damps the orders-of-magnitude variation in mempool size
    feat["mempool_size_log"] = np.log1p(mempool.fillna(0.0)).values

    avg_fee = _aligned("avg_fee")
    feat["avg_fee_pct_change_7"] = avg_fee.pct_change(7).fillna(0.0).values

    funding = _aligned("funding_rate")
    feat["funding_rate"] = funding.fillna(0.0).values
    funding_mean_7 = funding.rolling(7, min_periods=2).mean()
    funding_std_7 = funding.rolling(7, min_periods=2).std()
    feat["funding_rate_zscore_7"] = (
        (funding - funding_mean_7) / funding_std_7.replace(0, np.nan)
    ).fillna(0.0).values


def feature_conversion(
    data: pd.DataFrame,
    cross_assets: pd.DataFrame | None = None,
    external_signals: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Build the model's feature matrix from raw OHLCV.

    Adds, on top of the original 18 features:
      - cyclical day-of-week and month encodings (4 cols)
      - regime features: distance from 200dma, drawdown from ATH, vol regime
        percentile (3 cols)
      - higher-order return lags 14/21/30 (3 cols)
      - rolling skew + kurtosis of returns over 30 days (2 cols)
      - cross-asset 1d return + 5d vol for ETH/SPY/DXY/GOLD (8 cols)
      - external signals: Fear & Greed (sentiment), Blockchain.com on-chain
        metrics, Binance funding rate (8 cols)

    Total: 18 (original) + 20 (Round 2) + 8 (Round 3) = 46 feature columns,
    plus Close + Date which downstream training/inference code drops before
    fitting (Close is kept here so callers can compute multi-day targets).

    Optional `cross_assets` and `external_signals` DataFrames are zero-filled
    when missing or partial -- predictions remain valid but degraded.
    """
    df = _normalize_dates(data)

    feat = pd.DataFrame(index=df.index)
    feat["Date"] = df["Date"].values
    feat["Close"] = df["Close"].values

    # ---- original 18 features (logic preserved) ----
    feat["SMA_20"] = df["Close"].rolling(window=20).mean()
    feat["SMA_20_y"] = feat["SMA_20"].shift(1)
    feat["SMA_50"] = df["Close"].rolling(window=50).mean()
    feat["SMA_50_y"] = feat["SMA_50"].shift(1)

    feat["EMA_12"] = df["Close"].ewm(span=12, adjust=False).mean()
    feat["EMA_26"] = df["Close"].ewm(span=26, adjust=False).mean()
    feat["MACD"] = feat["EMA_12"] - feat["EMA_26"]

    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(span=14, adjust=False).mean()
    avg_loss = loss.ewm(span=14, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    feat["RSI"] = 100 - (100 / (1 + rs))

    feat["Returns"] = df["Close"].pct_change()
    feat["Close_SMA20_Ratio"] = df["Close"] / feat["SMA_20"].shift(1)
    feat["Close_SMA50_Ratio"] = df["Close"] / feat["SMA_50"].shift(1)
    feat["SMA_Cross"] = np.where(
        ((feat["SMA_20"] > feat["SMA_50"]) & (feat["SMA_20_y"] <= feat["SMA_50_y"])), 1,
        np.where(
            ((feat["SMA_20"] < feat["SMA_50"]) & (feat["SMA_20_y"] > feat["SMA_50_y"])), -1, 0,
        ),
    )
    feat["MACD_signal"] = feat["MACD"].ewm(span=9, adjust=False).mean()
    feat["MACD_histogram"] = feat["MACD"] - feat["MACD_signal"]
    feat["RSI_signal"] = np.where(feat["RSI"] > 70, 1, np.where(feat["RSI"] < 30, -1, 0))
    feat["Volume_change"] = df["Volume"].pct_change()
    feat["Volume_SMA_20"] = df["Volume"].rolling(window=20).mean()
    feat["Volume_SMA_20_Ratio"] = df["Volume"] / feat["Volume_SMA_20"].shift(1)
    feat["Lag_1"] = feat["Returns"].shift(1)
    feat["Lag_2"] = feat["Returns"].shift(2)
    feat["Lag_3"] = feat["Returns"].shift(3)
    feat["Lag_5"] = feat["Returns"].shift(5)
    feat["Lag_7"] = feat["Returns"].shift(7)
    feat["Volatility_5"] = feat["Returns"].rolling(window=5).std()
    feat["Volatility_10"] = feat["Returns"].rolling(window=10).std()
    feat["HL_Range_pct"] = (df["High"] - df["Low"]) / df["Close"]
    feat["OC_Range_pct"] = (df["Close"] - df["Open"]) / df["Open"]
    feat["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
    feat["Close_EMA20_diff"] = (df["Close"] - feat["EMA_20"]) / df["Close"]

    # ---- new cyclical features ----
    dow = df["Date"].dt.dayofweek
    month = df["Date"].dt.month
    feat["dow_sin"] = np.sin(2 * np.pi * dow / 7)
    feat["dow_cos"] = np.cos(2 * np.pi * dow / 7)
    feat["month_sin"] = np.sin(2 * np.pi * (month - 1) / 12)
    feat["month_cos"] = np.cos(2 * np.pi * (month - 1) / 12)

    # ---- regime features ----
    sma_200 = df["Close"].rolling(window=200).mean()
    feat["dist_from_200dma"] = (df["Close"] - sma_200) / df["Close"]
    rolling_max = df["Close"].cummax()
    feat["drawdown_from_ATH"] = df["Close"] / rolling_max - 1
    # vol_regime_pct: rank realised vol against a 90-day (3-month) lookback. 90 keeps
    # inference's warmup short enough to fit a ~280-day download window while still
    # capturing meaningful regime shifts.
    vol_30 = feat["Returns"].rolling(window=30).std()
    feat["vol_regime_pct"] = vol_30.rolling(window=90, min_periods=30).rank(pct=True)

    # ---- higher-order lags ----
    feat["Lag_14"] = feat["Returns"].shift(14)
    feat["Lag_21"] = feat["Returns"].shift(21)
    feat["Lag_30"] = feat["Returns"].shift(30)

    # ---- distribution shape ----
    feat["Returns_skew_30"] = feat["Returns"].rolling(window=30).skew()
    feat["Returns_kurt_30"] = feat["Returns"].rolling(window=30).kurt()

    # ---- cross-asset features ----
    _add_cross_asset_features(feat, df["Date"], cross_assets)

    # ---- orthogonal external signals ----
    _add_external_signal_features(feat, df["Date"], external_signals)

    feat.dropna(inplace=True)
    feat.reset_index(drop=True, inplace=True)
    # Keep Date and Close in the output: callers compute multi-day targets from
    # Close (Target = Close.shift(-N) / Close - 1) and use Date for alignment;
    # both are dropped before the model sees X.
    feat.drop(
        columns=[
            "SMA_20", "SMA_50", "SMA_20_y", "SMA_50_y",
            "EMA_12", "EMA_20", "EMA_26",
            "MACD_signal", "RSI_signal", "SMA_Cross",
            "Volume_SMA_20",
        ],
        inplace=True,
    )
    return feat
