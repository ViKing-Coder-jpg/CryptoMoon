import { useEffect, useState } from 'react'
import { FiBarChart2, FiShare2 } from 'react-icons/fi'
import BTCCandleChart from '../components/Charts'
import { api } from '../../functions'
import { useTitle } from '../hooks/useTitle.js'

const timeframes = ['1d', '5d', '1mo', '6mo', '1y', '5y', '10y']
const tabs = ['Price', 'Depth']


export default function Dashboard() {
  useTitle('Dashboard')
  const [activeTab, setActiveTab] = useState('Price')
  const [activeTimeframe, setActiveTimeframe] = useState('1d')
  const [liveData, setLiveData] = useState(null)

  useEffect(() => {
    const fetchLive = () => {
      api.get('/btc-live').then(res => setLiveData(res.data))
    }

    // Fetch immediately on mount
    fetchLive()

    // Then fetch every 3 seconds to keep it live
    const interval = setInterval(fetchLive, 3000)

    return () => clearInterval(interval)
  }, [])


  const getChartParams = (tf) => {
    switch (tf) {
      case '1d': return { period: '1d', interval: '1h' }
      case '5d': return { period: '5d', interval: '6h' }
      case '1mo': return { period: '1mo', interval: '1d' }
      case '6mo': return { period: '6mo', interval: '1d' }
      case '1y': return { period: '1y', interval: '1d' }
      case '5y': return { period: '5y', interval: '1wk' }
      case '10y': return { period: '10y', interval: '1mo' }
      default: return { period: '90d', interval: '1d' }
    }
  }

  const chartParams = getChartParams(activeTimeframe)

  return (
    <main className="min-h-[80vh] bg-[#F5F2EB]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600">
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-darkText">
              BTC/USD
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 font-semibold">Live Market</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-display text-5xl font-black text-darkText sm:text-6xl">
                {liveData ? `$${liveData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'Loading...'}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${liveData?.change_24h_pct >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <span>{liveData?.change_24h_pct >= 0 ? '↗' : '↘'}</span>
                  {liveData ? `${liveData.change_24h_pct >= 0 ? '+' : ''}${liveData.change_24h_pct.toFixed(2)}%` : '—'}
                </span>
                <span className="text-sm text-gray-500">
                  {liveData ? `${liveData.change_24h_usd >= 0 ? '+' : ''}$${Math.abs(liveData.change_24h_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })} (24h)` : '—'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-[#F0B429] px-8 py-3 text-sm font-bold text-darkText">
                Buy BTC
              </button>
              <button className="rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-darkText">
                Sell BTC
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {tabs.map((tab) => {
                    const isActive = tab === activeTab
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive
                          ? 'bg-white text-darkText shadow-sm'
                          : 'text-gray-500 hover:text-darkText'
                          }`}
                      >
                        {tab}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {timeframes.map((frame) => {
                    const isActive = frame === activeTimeframe
                    return (
                      <button
                        key={frame}
                        type="button"
                        onClick={() => setActiveTimeframe(frame)}
                        className={`rounded-full px-3 py-1 transition ${isActive
                          ? 'bg-darkText text-white'
                          : 'text-gray-500 hover:text-darkText'
                          }`}
                      >
                        {frame}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#1b1b1b] via-[#2c2c2c] to-[#111111]">
                  {/* passing timeframe parameters to Chart */}
                  <BTCCandleChart period={chartParams.period} interval={chartParams.interval} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">24H HIGH / LOW</p>
                  <p className="mt-2 text-sm font-bold text-darkText">
                    {liveData ? `$${liveData.high_24h.toLocaleString()} / $${liveData.low_24h.toLocaleString()}` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">MARKET CAP</p>
                  <p className="mt-2 text-sm font-bold text-darkText">
                    {liveData ? `$${(liveData.price * 19.7 / 1e6).toFixed(2)}T` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">VOLUME (24H)</p>
                  <p className="mt-2 text-sm font-bold text-darkText">
                    {liveData ? `$${(liveData.volume_24h / 1e9).toFixed(2)}B` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">CIRCULATING SUPPLY</p>
                  <p className="mt-2 text-sm font-bold text-darkText">19.7M BTC</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-darkText">
                <FiBarChart2 className="h-5 w-5" />
                <span className="text-lg font-bold">Live Order Book</span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                <span>PRICE (USD)</span>
                <span>SIZE (BTC)</span>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { price: '68,439.50', size: '0.420', width: 'w-[45%]' },
                  { price: '68,437.00', size: '1.125', width: 'w-[70%]' },
                  { price: '68,435.20', size: '0.054', width: 'w-[30%]' },
                ].map((row) => (
                  <div key={row.price} className="flex items-center justify-between text-sm">
                    <span className="text-red-400">{row.price}</span>
                    <div className="flex w-32 items-center justify-end">
                      <div className={`ml-auto h-7 ${row.width} rounded bg-red-100`}>
                        <div className="flex h-full items-center justify-end pr-2 text-xs font-semibold text-gray-700">
                          {row.size}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-gray-100" />
              <div className="text-center">
                <div className="text-lg font-bold text-darkText">$68,432.10</div>
                <div className="text-xs text-gray-400">Spread: 0.15 (0.002%)</div>
              </div>
              <div className="my-4 border-t border-gray-100" />

              <div className="space-y-2">
                {[
                  { price: '68,431.95', size: '0.880', width: 'w-[55%]' },
                  { price: '68,430.00', size: '2.441', width: 'w-[80%]' },
                  { price: '68,428.45', size: '0.110', width: 'w-[35%]' },
                ].map((row) => (
                  <div key={row.price} className="flex items-center justify-between text-sm">
                    <span className="text-teal-500">{row.price}</span>
                    <div className="flex w-32 items-center justify-end">
                      <div className={`ml-auto h-7 ${row.width} rounded bg-blue-100`}>
                        <div className="flex h-full items-center justify-end pr-2 text-xs font-semibold text-gray-700">
                          {row.size}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

