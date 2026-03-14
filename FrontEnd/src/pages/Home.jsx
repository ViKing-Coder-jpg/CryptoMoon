import { MarketStatusCard } from '../components/MarketStatusCard.jsx'
import {Link} from 'react-router-dom'

const features = [
  {
    title: 'AI Predictions',
    description: 'Deep learning models processing 200+ on-chain metrics hourly.',
    icon: <path d="M12 3v6l4 2" />,
  },
  {
    title: 'Real-Time Data',
    description: 'Low-latency data streams from top global exchanges.',
    icon: <path d="M3 12h18" />,
  },
  {
    title: 'Indicator Insights',
    description: 'Proprietary technical signals refined by algorithmic history.',
    icon: <path d="M4 16l4-5 5 4 7-9" />,
  },
  {
    title: 'Historical Analysis',
    description: 'Backtested performance reports across multiple bull cycles.',
    icon: <path d="M5 5h14v14H5z" />,
  },
]

export function Home() {
  return (
    <main className="space-y-20 pb-20">
      <section className="pt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-yellow-200 px-4 py-2 text-[11px] font-bold tracking-[0.24em] text-yellow-700">
                NEXT-GEN AI FORECASTING
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-darkText sm:text-5xl lg:text-6xl">
                Predict Bitcoin.
                <span className="block text-gold">Ride the Future.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                Harness the power of neural networks for institutional-grade Bitcoin price forecasting. Real-time analytics for the modern digital asset explorer.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link to='/predictions'><button className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-darkText shadow-lg shadow-gold/30 hover:cursor-pointer">
                  Start Predicting
                </button></Link>
                <Link to='/dashboard'><button className="rounded-full border border-gold px-6 py-3 text-sm font-semibold text-darkText hover:cursor-pointer">
                  View Live Charts
                </button></Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a4b12] via-[#1d0f05] to-[#120a04] p-10">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd98b] via-[#cc8a16] to-[#9a5b00] shadow-2xl">
                  <div className="absolute inset-4 rounded-full border-2 border-white/40"></div>
                  <span className="font-display text-6xl font-bold text-[#5f3a00]">B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-3xl font-extrabold text-darkText sm:text-4xl">Premium Intelligence</h2>
          <p className="mt-2 text-gray-600">Advanced analytical tools for high-precision decision making.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-gold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {feature.icon}
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-darkText">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-6">
          <MarketStatusCard
            label="LIVE MARKET STATUS"
            name="Bitcoin (BTC)"
            price="$68,432.10"
            change="+3.24%"
            low="$66,120"
            high="$69,500"
            times={["00:00", "06:00", "12:00", "18:00", "24:00"]}
          />
        </div>
      </section>
    </main>
  )
}
