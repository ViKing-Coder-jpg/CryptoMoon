import burstImage from '../assets/about-burst.svg'
// Developer image will be used below
import developerAvatar from '../assets/Avatar.png' // Using team-1.svg as a placeholder for now
import { useTitle } from '../hooks/useTitle.js'

const coreTechnology = [
  {
    title: 'Neural Forecasting',
    description:
      'Deep learning architectures that simulate millions of market outcomes to identify the path of least resistance.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 6v12" />
        <path d="M8 9v6" />
        <path d="M16 9v6" />
      </svg>
    ),
  },
  {
    title: 'Sentiment Synthesis',
    description:
      'Real-time NLP processing of global social chatter, whitepapers, and developer activity to gauge true market conviction.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
  {
    title: 'Cross-Chain Logic',
    description:
      'Unified intelligence layer that monitors liquidity migrations across 40+ Layer 1 and Layer 2 ecosystems simultaneously.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
      </svg>
    ),
  },
]




export function About() {
  useTitle('About')
  return (
    <main className="bg-cream text-darkText">
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.32em] text-gold">OUR MISSION</p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Sovereign Intelligence for the{' '}
            <span className="text-gold">Future of Finance.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm text-gray-600">
            We bridge the gap between chaotic market volatility and institutional-grade clarity through the power of
            advanced neural forecasting.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="rounded-3xl bg-neutral-900 p-5 shadow-[0_18px_30px_rgba(0,0,0,0.18)]">
            <img src={burstImage} alt="Neural core" className="w-full rounded-2xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">THE CRYPTOMOON STORY</p>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              Born in the high-frequency trading hubs of Zurich and refined by silicon valley&apos;s leading AI architects,
              CryptoMoon was founded on a single premise: <span className="font-semibold text-darkText">information is not intelligence.</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              In an era where retail sentiment and institutional flows collide at millisecond speeds, traditional
              forecasting models fail. We built a proprietary engine that processes 4.2 petabytes of cross-chain data
              daily, identifying signals before they manifest as price action.
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Today, CryptoMoon serves the global elite, providing the sovereign tools required to navigate the
              decentralized landscape with the precision of a master architect.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-sm font-semibold tracking-[0.22em] text-darkText">CORE TECHNOLOGY</h2>
          <div className="mx-auto mt-2 h-0.5 w-10 bg-gold" />
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          {coreTechnology.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_12px_24px_rgba(17,17,17,0.08)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-darkText">
                {item.icon}
              </div>
              <h3 className="mt-5 text-sm font-semibold text-darkText">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="text-left mb-16">
            <h2 className="font-display text-4xl font-bold text-darkText">Meet the Developer</h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              CryptoMoon is built and maintained by a passionate developer who cares deeply about
              clean design, thoughtful UX, and scalable systems.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[300px_1fr] items-center">
            <div className="flex flex-col items-start">
              <div className="w-48 h-48 rounded-full bg-white p-2 shadow-xl mb-6 relative group overflow-hidden">
                <img
                  src={developerAvatar}
                  alt="Vinayak Mohakud"
                  className="w-full h-full rounded-full object-cover bg-neutral-100 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-2xl font-bold text-darkText">Vinayak Mohakud</h3>
              <p className="text-sm font-semibold tracking-wider text-gold uppercase mt-1">
                Full Stack Developer & Creator of CryptoMoon
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -left-10 text-9xl text-gold/10 font-serif leading-none">“</div>
              <p className="text-xl md:text-2xl leading-relaxed text-gray-700 font-medium italic relative z-10">
                I design and build end-to-end digital products with a focus on performance,
                accessibility, and real-world impact. CryptoMoon is a reflection of my
                belief that technology enhanced with AI should help humans to reach new heights.
              </p>
              <div className="absolute -bottom-10 -right-10 text-9xl text-gold/10 font-serif leading-none">”</div>
            </div>
          </div>
        </div>
      </section>


    </main>
  )
}
