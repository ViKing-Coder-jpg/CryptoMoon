import { useEffect, useMemo, useState } from 'react'
import { FiBarChart2, FiBell, FiClock, FiShare2 } from 'react-icons/fi'

const timeframes = ['1H', '4H', '1D', '1W', 'ALL']
const tabs = ['Price', 'Depth']

const initialTrades = [
  { price: 68432.1, amount: 0.025, time: '12:44:02', side: 'buy' },
  { price: 68431.5, amount: 1.0, time: '12:43:58', side: 'sell' },
  { price: 68432.0, amount: 0.142, time: '12:43:55', side: 'buy' },
  { price: 68431.9, amount: 0.5, time: '12:43:51', side: 'sell' },
  { price: 68431.0, amount: 0.005, time: '12:43:48', side: 'sell' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Price')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [trades, setTrades] = useState(initialTrades)

  useEffect(() => {
    const interval = setInterval(() => {
      const price = 68432 + (Math.random() - 0.5) * 8
      const amount = Math.random() * 1.5 + 0.01
      const side = Math.random() > 0.5 ? 'buy' : 'sell'
      const time = new Date().toLocaleTimeString()

      setTrades((prev) => {
        const next = [
          {
            price: Number(price.toFixed(2)),
            amount: Number(amount.toFixed(3)),
            time,
            side,
          },
          ...prev,
        ]
        return next.slice(0, 5)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const bars = useMemo(
    () => [
      'h-8',
      'h-12',
      'h-6',
      'h-16',
      'h-20',
      'h-18',
      'h-24',
      'h-20',
      'h-16',
      'h-14',
      'h-20',
      'h-28',
      'h-24',
      'h-16',
      'h-20',
      'h-32',
      'h-26',
      'h-20',
      'h-24',
      'h-28',
    ],
    []
  )

  return (
    <main className="min-h-screen bg-[#F5F2EB]">
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
                $68,432.10
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">
                  <span>↗</span>
                  +4.25%
                </span>
                <span className="text-sm text-gray-500">+$2,790.45 (24h)</span>
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
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          isActive
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
                        className={`rounded-full px-3 py-1 transition ${
                          isActive
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

              <div className="relative mt-6 h-64 w-full rounded-xl bg-[#FEFBF0]">
                <div className="flex h-full items-end gap-2 px-4 pb-6">
                  {bars.map((height, index) => (
                    <div
                      key={`bar-${height}-${index}`}
                      className={`w-3 rounded-full bg-[#F0B429] ${height} ${
                        index % 2 === 0 ? 'opacity-60' : 'opacity-90'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-[#F0B429] px-3 py-1 text-sm font-bold text-darkText">
                  $68,432.10
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">24H HIGH / LOW</p>
                  <p className="mt-2 text-sm font-bold text-darkText">$69,120 / $67,540</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">MARKET CAP</p>
                  <p className="mt-2 text-sm font-bold text-darkText">$1.34T</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">VOLUME (24H)</p>
                  <p className="mt-2 text-sm font-bold text-darkText">$34.2B</p>
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

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-darkText">
                <FiClock className="h-5 w-5" />
                <span className="text-lg font-bold">Recent Trades</span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {trades.map((trade, index) => (
                  <div key={`${trade.time}-${index}`} className="grid grid-cols-3 items-center gap-2">
                    <span className={trade.side === 'buy' ? 'text-emerald-600' : 'text-red-400'}>
                      {trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-center text-darkText">{trade.amount.toFixed(3)} BTC</span>
                    <span className="text-right text-xs text-gray-400">{trade.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-100 bg-white px-6 py-6 shadow-sm md:flex-row md:items-center md:px-8">
            <div>
              <h3 className="text-xl font-bold text-darkText">Institutional Grade Trading</h3>
              <p className="mt-2 text-sm text-gray-500">
                Unlock advanced features including API access, lower fees, and priority support.
              </p>
            </div>
            <button className="rounded-full bg-[#F0B429] px-8 py-3 text-sm font-bold text-darkText">
              Upgrade to Pro
            </button>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-darkText">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0B429] text-sm font-black text-darkText">
                  B
                </div>
                CryptoMoon
              </div>
              <p className="mt-3 text-sm text-gray-500">
                The world's most luxurious crypto trading platform. Secure, fast, and exclusive.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F0B429]">Company</p>
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <p>About Us</p>
                <p>Careers</p>
                <p>Press</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F0B429]">Resources</p>
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <p>Trading Rules</p>
                <p>API Docs</p>
                <p>Support</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F0B429]">Legal</p>
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Security</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-gray-100 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <span>© 2024 CryptoMoon. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <FiShare2 className="h-4 w-4" />
              <FiBell className="h-4 w-4" />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
