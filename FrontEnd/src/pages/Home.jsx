import { useEffect, useState } from 'react'
import { FiActivity, FiBarChart2, FiTrendingUp, FiZap } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTitle } from '../hooks/useTitle.js'
import { api } from '../../functions'

const features = [
  {
    title: 'AI Predictions',
    description: 'Neural network analysis processed through 48 key market metrics for 92% historical accuracy.',
    icon: FiZap,
  },
  {
    title: 'Real-Time Data',
    description: 'Nanosecond latency feeds from global exchanges ensuring you are never behind the tape.',
    icon: FiActivity,
  },
  {
    title: 'Indicator Insights',
    description: 'Aggregated sentiment analysis and proprietary liquidity heatmaps in one dashboard.',
    icon: FiTrendingUp,
  },
  {
    title: 'Trend Analysis',
    description: 'Multi-cycle fractal comparisons to identify recurring patterns in Bitcoin price action.',
    icon: FiBarChart2,
  },
]
export function Home() {
  useTitle('Home')
  const [liveData, setLiveData] = useState(null)

  useEffect(() => {
    const fetchLive = () => {
      api.get('/btc-live')
        .then(res => setLiveData(res.data))
        .catch(err => console.error('Error fetching live data:', err))
    }

    fetchLive()
    const interval = setInterval(fetchLive, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="space-y-20 pb-20">
      <section className="relative min-h-[80vh] overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fff6db] via-[#fef8e7] to-cream"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
            <span className="inline-flex items-center rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-[10px] font-bold tracking-[0.3em] text-gold">
              THE FUTURE OF WEALTH
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-darkText sm:text-5xl lg:text-6xl">
              <span className="block text-gold">Predict Bitcoin.</span>
              <span className="block italic text-darkText">Ride the Future.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              AI-powered Bitcoin price forecasting with real-time analytics. Secure your position in the next market cycle.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link to="/predictions">
                <button className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-darkText shadow-lg shadow-gold/30">
                  Start Predicting
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="rounded-full border border-gold px-7 py-3 text-sm font-semibold text-darkText">
                  View Live Charts
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full rounded-[28px] bg-white/90 p-8 text-center shadow-[0_24px_60px_rgba(13,11,7,0.1)] md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Current BTC Index</p>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display text-4xl font-extrabold text-gold sm:text-5xl">
                    {liveData ? `$${liveData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$68,432.12'}
                  </span>
                  <span className={`text-sm font-semibold ${liveData?.change_24h_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {liveData ? `${liveData.change_24h_pct >= 0 ? '+' : ''}${liveData.change_24h_pct.toFixed(2)}% Today` : '+4.2% Today'}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-[55%]">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>LIVE STREAM</span>
                  <span className="inline-flex items-center gap-2 text-gold">
                    <span className="h-2 w-2 rounded-full bg-gold"></span>
                    Active
                  </span>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#fff6d8] via-[#fff1b3] to-[#ffe28a] p-3">
                  <svg viewBox="0 0 420 120" className="h-24 w-full">
                    <path
                      d="M10 90 C40 40, 80 40, 110 70 S180 110, 210 60 S280 20, 320 50 S370 120, 410 40"
                      fill="none"
                      stroke="#F0B429"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-extrabold text-darkText sm:text-4xl">Institutional Grade Intelligence</h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gold"></div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="rounded-2xl bg-white p-6 text-center shadow-[0_18px_35px_rgba(17,17,17,0.06)]">
                  <div className="mb-4 mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-darkText">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-full rounded-[32px] border border-[#f1e8c9] bg-[#fff9ea] px-6 py-12 text-center shadow-[0_25px_50px_rgba(15,12,7,0.08)] sm:px-12">
            <h3 className="font-display text-3xl font-extrabold italic text-gold sm:text-4xl">
              Ready to Master the Moon?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
              Join the elite 2% of traders using sovereign futurist technology.
            </p>
            <Link to='/predictions'>
              <button className="mt-6 rounded-full bg-darkText px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/20">
                Let's Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
