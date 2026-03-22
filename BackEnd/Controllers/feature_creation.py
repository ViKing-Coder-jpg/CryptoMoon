import numpy as np
import pandas as pd



def feature_conversion(data):
  featData=pd.DataFrame()
  featData['Close']=data['Close']

  featData['SMA_20']=data['Close'].rolling(window=20).mean()
  featData['SMA_20_y']=featData['SMA_20'].shift(1)
  featData['SMA_50']=data['Close'].rolling(window=50).mean()
  featData['SMA_50_y']=featData['SMA_50'].shift(1)

  featData['EMA_12'] = data['Close'].ewm(span=12, adjust=False).mean()
  featData['EMA_26'] = data['Close'].ewm(span=26, adjust=False).mean()
  featData['MACD'] = featData['EMA_12'] - featData['EMA_26']

  delta = data['Close'].diff()
  gain = delta.clip(lower=0)
  loss = -delta.clip(upper=0)
  avg_gain = gain.ewm(span=14, adjust=False).mean()
  avg_loss = loss.ewm(span=14, adjust=False).mean()
  rs = avg_gain / (avg_loss + 1e-9)
  featData['RSI'] = 100 - (100 / (1 + rs))

  featData['Returns']=data['Close'].pct_change()
  featData['Close_SMA20_Ratio']=data['Close']/featData['SMA_20'].shift(1)
  featData['Close_SMA50_Ratio']=data['Close']/featData['SMA_50'].shift(1)
  featData['SMA_Cross']=np.where(((featData['SMA_20']>featData['SMA_50'])& (featData['SMA_20_y']<=featData['SMA_50_y'])),1,np.where(((featData['SMA_20']<featData['SMA_50'])& (featData['SMA_20_y']>featData['SMA_50_y'])),-1,0))
  featData['MACD_signal']=featData['MACD'].ewm(span=9, adjust=False).mean()
  featData['MACD_histogram']=featData['MACD']-featData['MACD_signal']
  featData['RSI_signal']=np.where(featData['RSI']>70,1,np.where(featData['RSI']<30,-1,0))
  featData['Volume_change']=data['Volume'].pct_change()
  featData['Volume_SMA_20'] = data['Volume'].rolling(window=20).mean()
  featData['Volume_SMA_20_Ratio'] = data['Volume'] / featData['Volume_SMA_20'].shift(1)
  featData['Lag_1']=featData['Returns'].shift(1)
  featData['Lag_2']=featData['Returns'].shift(2)
  featData['Lag_3']=featData['Returns'].shift(3)
  featData['Lag_5']=featData['Returns'].shift(5)
  featData['Lag_7']=featData['Returns'].shift(7)
  featData['Volatility_5']=featData['Returns'].rolling(window=5).std()
  featData['Volatility_10']=featData['Returns'].rolling(window=10).std()
  featData['HL_Range_pct'] = (data['High'] - data['Low']) / data['Close']
  featData['OC_Range_pct'] = (data['Close'] - data['Open']) / data['Open']
  featData['EMA_20'] = data['Close'].ewm(span=20, adjust=False).mean()
  featData['Close_EMA20_diff'] = (data['Close'] - featData['EMA_20']) / data['Close']
  featData.dropna(inplace=True)
  featData.reset_index(drop=True,inplace=True)
  featData.drop(['SMA_20','SMA_50','SMA_20_y','SMA_50_y','EMA_12','EMA_20','EMA_26','Close','MACD_signal','RSI_signal','SMA_Cross','Volume_SMA_20'],axis=1,inplace=True)
  return featData
