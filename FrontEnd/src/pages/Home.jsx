import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  FiActivity, FiBarChart2, FiTrendingUp, FiZap,
  FiArrowRight, FiShield, FiCpu, FiGlobe, FiLayers
} from 'react-icons/fi'
import { useTitle } from '../hooks/useTitle.js'
import { api } from '../../functions'

gsap.registerPlugin(ScrollTrigger)

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    title: 'AI Predictions',
    description: 'Neural network analysis processed through 48 key market metrics for 92% historical accuracy.',
    icon: FiZap,
    color: '#F0B429',
  },
  {
    title: 'Real-Time Data',
    description: 'Nanosecond latency feeds from global exchanges ensuring you are never behind the tape.',
    icon: FiActivity,
    color: '#FFD166',
  },
  {
    title: 'Indicator Insights',
    description: 'Aggregated sentiment analysis and proprietary liquidity heatmaps in one dashboard.',
    icon: FiTrendingUp,
    color: '#E9A915',
  },
  {
    title: 'Trend Analysis',
    description: 'Multi-cycle fractal comparisons to identify recurring patterns in Bitcoin price action.',
    icon: FiBarChart2,
    color: '#C8880A',
  },
]

const stats = [
  { label: 'Accuracy Rate', value: '92%', icon: FiCpu },
  { label: 'Global Users', value: '48K+', icon: FiGlobe },
  { label: 'Data Points', value: '1B+', icon: FiLayers },
  { label: 'Uptime', value: '99.9%', icon: FiShield },
]

const problems = [
  {
    tag: 'PROBLEM 1',
    title: 'Scattered Across Exchanges',
    description: 'Your portfolio is fragmented across 10+ platforms with no unified view.',
  },
  {
    tag: 'PROBLEM 2',
    title: 'Wasting 10+ Hours Monthly',
    description: 'Manual tracking and analysis drains your most valuable resource — time.',
  },
  {
    tag: 'PROBLEM 3',
    title: 'Zero Portfolio Visibility',
    description: 'Without real-time data, every decision is a shot in the dark.',
  },
]

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef(null)

  useEffect(() => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''))
    const suffix = value.replace(/[0-9.]/g, '')
    const obj = { val: 0 }
    gsap.to(obj, {
      val: num,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      onUpdate: () => setDisplay(obj.val.toFixed(num % 1 !== 0 ? 1 : 0) + suffix),
    })
  }, [value])

  return <span ref={ref}>{display}</span>
}

// ─── Floating Orb ─────────────────────────────────────────────────────────────

function FloatingOrb({ size, x, y, delay, opacity, blur }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y, opacity,
        background: 'radial-gradient(circle, #F0B429 0%, #FFD166 40%, transparent 70%)',
        filter: `blur(${blur}px)`,
      }}
      animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

// ─── Sparkle particle ────────────────────────────────────────────────────────

function Sparkle({ x, y, delay }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full bg-gold pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -20] }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

// ─── Ticker Band ──────────────────────────────────────────────────────────────

const tickerItems = [
  '₿ BTC +4.2%', '⬡ ETH +2.8%', '◎ SOL +6.1%', '⬡ BNB -0.4%',
  '◈ AVAX +3.7%', '⬙ MATIC +1.9%', '₿ BTC +4.2%', '⬡ ETH +2.8%',
  '◎ SOL +6.1%', '⬡ BNB -0.4%', '◈ AVAX +3.7%', '⬙ MATIC +1.9%',
]

function TickerBand() {
  return (
    <div className="w-full overflow-hidden border-y border-gold/20 bg-amber-50/60 backdrop-blur-sm py-3 relative">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {tickerItems.map((t, i) => (
          <span key={i} className="text-xs font-bold tracking-widest text-amber-700 shrink-0">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Live Chart SVG ───────────────────────────────────────────────────────────

function AnimatedChart() {
  const pathRef = useRef(null)

  useEffect(() => {
    if (!pathRef.current) return
    const length = pathRef.current.getTotalLength()
    gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: 'power2.inOut',
      delay: 0.5,
    })
  }, [])

  return (
    <svg viewBox="0 0 420 120" className="h-24 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E9A915" />
          <stop offset="100%" stopColor="#FFD166" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        ref={pathRef}
        d="M10 90 C40 40, 80 40, 110 70 S180 110, 210 60 S280 20, 320 50 S370 120, 410 40"
        fill="none"
        stroke="url(#chartGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  )
}

// ─── Dashboard Mock Card ──────────────────────────────────────────────────────

function DashboardMock({ liveData }) {
  const price = liveData?.price
    ? `$${liveData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : '$68,432.12'
  const change = liveData?.change_24h_pct !== undefined
    ? `${liveData.change_24h_pct >= 0 ? '+' : ''}${liveData.change_24h_pct.toFixed(2)}%`
    : '+4.2%'
  const isPositive = (liveData?.change_24h_pct ?? 4.2) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl mx-auto mt-16"
      style={{ perspective: 1200 }}
    >
      {/* Glow backdrop */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/60 via-yellow-100/40 to-orange-100/50 blur-2xl" />

      <div className="relative rounded-[28px] border border-amber-200/80 bg-white/80 backdrop-blur-xl shadow-[0_32px_80px_rgba(240,180,41,0.18)] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-yellow-300" />
            <span className="h-3 w-3 rounded-full bg-green-300" />
          </div>
          <span className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase">CryptoMoon Dashboard</span>
          <motion.span
            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> LIVE
          </motion.span>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-[1fr_1.6fr] gap-0">
          {/* Left */}
          <div className="border-r border-amber-100/80 p-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">Current BTC Price</p>
              <motion.p
                key={price}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 font-display text-3xl font-extrabold text-amber-700"
              >
                {price}
              </motion.p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {change} Today
              </span>
            </div>
            {/* Mini stats */}
            {[['Market Cap', '$1.32T'], ['Volume 24h', '$28.4B'], ['Dominance', '52.4%']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">{k}</span>
                <span className="font-bold text-amber-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Right – chart */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400 uppercase tracking-widest">Price Chart</span>
              {['1H', '1D', '1W', '1M'].map(t => (
                <button key={t} className={`px-2 py-0.5 rounded-full text-[10px] ${t === '1D' ? 'bg-amber-400 text-white' : 'text-gray-400 hover:text-amber-600'}`}>{t}</button>
              ))}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/60 p-3 border border-amber-100/60">
              <AnimatedChart />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" />
              BTC/USD — Real-time stream
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Problem Card ─────────────────────────────────────────────────────────────

function ProblemCard({ tag, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: '0 28px 60px rgba(240,180,41,0.18)' }}
      className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-white/70 backdrop-blur-sm p-7 cursor-default"
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-gradient-to-bl from-amber-100/60 to-transparent" />
      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
        {tag}
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-amber-900 leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-white/80 backdrop-blur-sm p-7 shadow-[0_8px_30px_rgba(240,180,41,0.08)] cursor-default"
    >
      <div
        className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: `${feature.color}22`, color: feature.color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}15 0%, transparent 60%)` }} />
      <h3 className="text-base font-bold text-amber-900">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
    </motion.div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export function Home() {
  useTitle('Home')
  const [liveData, setLiveData] = useState(null)
  const heroRef = useRef(null)
  const statsRef = useRef(null)

  // Live BTC fetch
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

  // GSAP hero text stagger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-word',
        { opacity: 0, y: 60, rotateX: -40 },
        {
          opacity: 1, y: 0, rotateX: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: 'back.out(1.7)',
          delay: 0.2,
        }
      )
      gsap.fromTo(
        '.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.0 }
      )
      gsap.fromTo(
        '.hero-cta',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 1.3 }
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // GSAP horizontal scroll for stats
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stat-card',
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%', once: true },
        }
      )
    }, statsRef)
    return () => ctx.revert()
  }, [])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <main className="relative overflow-x-hidden bg-gradient-to-b from-amber-50 via-yellow-50/40 to-white">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20 pb-10 px-6"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50/30" />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(240,180,41,0.12),transparent)]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(240,180,41,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(240,180,41,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Floating orbs */}
        <FloatingOrb size={320} x="5%" y="10%" delay={0} opacity={0.12} blur={60} />
        <FloatingOrb size={220} x="75%" y="5%" delay={1.5} opacity={0.1} blur={50} />
        <FloatingOrb size={160} x="85%" y="55%" delay={3} opacity={0.08} blur={40} />
        <FloatingOrb size={100} x="10%" y="70%" delay={2} opacity={0.07} blur={30} />

        {/* Sparkles */}
        <Sparkle x="20%" y="20%" delay={0} />
        <Sparkle x="80%" y="15%" delay={0.8} />
        <Sparkle x="65%" y="70%" delay={1.6} />
        <Sparkle x="30%" y="75%" delay={2.4} />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/80 backdrop-blur-sm px-5 py-2 text-[10px] font-bold tracking-[0.3em] text-amber-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            #1 AI-POWERED BITCOIN INTELLIGENCE
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          className="mt-8 text-center font-display text-5xl font-extrabold leading-[1.1] text-amber-900 sm:text-6xl lg:text-7xl max-w-4xl"
          style={{ perspective: 800 }}
        >
          {['Predict', 'Bitcoin.', 'Ride', 'the', 'Future.'].map((word, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em] last:mr-0"
              style={{ color: i < 2 ? '#92400e' : i === 4 ? '#F0B429' : '#78350f' }}>
              {word}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p className="hero-sub mt-5 max-w-xl text-center text-base leading-relaxed text-amber-700/70 sm:text-lg">
          AI-powered Bitcoin price forecasting with real-time analytics. Secure your position in the next market cycle.
        </p>

        {/* CTAs */}
        <div className="hero-cta mt-9 flex flex-wrap justify-center gap-4">
          <Link to="/predictions">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(240,180,41,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-8 py-3.5 text-sm font-bold text-amber-900 shadow-[0_12px_30px_rgba(240,180,41,0.35)]"
            >
              Start Predicting
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FiArrowRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          </Link>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#fff9e6' }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border-2 border-amber-300 bg-white/70 backdrop-blur-sm px-8 py-3.5 text-sm font-bold text-amber-800 transition-colors"
            >
              View Live Charts
            </motion.button>
          </Link>
        </div>

        {/* Dashboard mock */}
        <DashboardMock liveData={liveData} />

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-amber-400"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-8 w-5 rounded-full border-2 border-amber-300 flex items-start justify-center pt-1">
            <motion.div
              className="h-1.5 w-1 rounded-full bg-amber-400"
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── TICKER ─────────────────────────────────────────────────── */}
      <TickerBand />

      {/* ─── STATS ──────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="stat-card rounded-3xl border border-amber-100 bg-white/70 backdrop-blur-sm p-6 text-center shadow-[0_4px_20px_rgba(240,180,41,0.08)]">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-display text-3xl font-extrabold text-amber-700">
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────── */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-500">Platform</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold text-amber-900 sm:text-5xl">
              Institutional Grade Intelligence
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400"
          >
            Trusted by top crypto brands worldwide
          </motion.p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {['Binance', 'Coinbase', 'Kraken', 'Gemini', 'OKX'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.08 }}
                className="rounded-2xl border border-amber-100 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-amber-700 shadow-sm cursor-default"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEMS ───────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-500">Problem</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold text-amber-900">
              Tracking crypto across exchanges is messy
            </h2>
          </motion.div>
          <div className="grid gap-5 md:grid-cols-3">
            {problems.map((p, i) => <ProblemCard key={p.tag} {...p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[36px] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50/40 px-8 py-16 text-center shadow-[0_32px_80px_rgba(240,180,41,0.16)]"
          >
            {/* Corner orbs */}
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-yellow-200/40 blur-3xl" />

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display text-4xl font-extrabold italic text-amber-900 sm:text-5xl"
            >
              Ready to Master the Moon?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mx-auto mt-4 max-w-lg text-base text-amber-700/70"
            >
              Join the elite 2% of traders using sovereign futurist technology.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link to="/predictions">
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: '0 20px 40px rgba(120,53,15,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-gradient-to-r from-amber-800 to-amber-700 px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg"
                >
                  Let's Get Started
                </motion.button>
              </Link>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full border-2 border-amber-300 bg-white/80 px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-800 backdrop-blur-sm"
                >
                  View Demo
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
