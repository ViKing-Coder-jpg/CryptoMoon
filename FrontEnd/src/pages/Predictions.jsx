import { useMemo, useState } from 'react'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function Predictions() {
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [smaEnabled, setSmaEnabled] = useState(true)
  const [rsiEnabled, setRsiEnabled] = useState(false)
  const [macdEnabled, setMacdEnabled] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(9)
  const [currentYear, setCurrentYear] = useState(2023)
  const [selectedDate, setSelectedDate] = useState(5)

  const today = new Date()

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const startDay = firstDayOfMonth.getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const cells = []

    for (let i = startDay - 1; i >= 0; i -= 1) {
      cells.push({
        day: daysInPrevMonth - i,
        inMonth: false,
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, inMonth: true })
    }

    while (cells.length < 42) {
      cells.push({ day: cells.length - (startDay + daysInMonth) + 1, inMonth: false })
    }

    return cells
  }, [currentMonth, currentYear])

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
      return
    }
    setCurrentMonth((prev) => prev - 1)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
      return
    }
    setCurrentMonth((prev) => prev + 1)
  }

  const timeframeOptions = ['1D', '7D', '30D']

  const indicators = [
    {
      label: 'Moving Average (SMA)',
      enabled: smaEnabled,
      toggle: () => setSmaEnabled((prev) => !prev),
    },
    {
      label: 'Relative Strength (RSI)',
      enabled: rsiEnabled,
      toggle: () => setRsiEnabled((prev) => !prev),
    },
    {
      label: 'MACD Convergence',
      enabled: macdEnabled,
      toggle: () => setMacdEnabled((prev) => !prev),
    },
  ]

  return (
    <main className="min-h-screen bg-[#F5F2EB]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-darkText sm:text-5xl">
            Bitcoin Price <span className="text-[#F0B429]">Prediction</span> Dashboard
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Advanced AI Forecasting Engine utilizing neural networks and sentiment analysis.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-darkText">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                    <circle cx="8" cy="6" r="2" />
                    <circle cx="16" cy="12" r="2" />
                    <circle cx="10" cy="18" r="2" />
                  </svg>
                  <span className="text-lg font-bold">Prediction Parameters</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .67.39 1.27 1 1.51.26.11.54.17.83.17H21a2 2 0 1 1 0 4h-.09c-.29 0-.57.06-.83.17-.61.24-1 .84-1 1.51Z" />
                </svg>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">FORECASTING TIMEFRAME</p>
                <div className="mt-3 flex gap-3">
                  {timeframeOptions.map((option) => {
                    const isActive = option === activeTimeframe
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setActiveTimeframe(option)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? 'border-[#F0B429] text-[#F0B429]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">TECHNICAL INDICATORS</p>
                <div className="mt-3 space-y-3">
                  {indicators.map((indicator) => (
                    <div key={indicator.label} className="flex items-center justify-between rounded-full bg-[#FBFBFB] px-4 py-3">
                      <span className={`text-sm ${indicator.enabled ? 'font-semibold text-darkText' : 'text-gray-500'}`}>
                        {indicator.label}
                      </span>
                      <button
                        type="button"
                        onClick={indicator.toggle}
                        className={`flex h-6 w-12 items-center rounded-full p-0.5 transition-colors ${
                          indicator.enabled ? 'bg-[#F0B429]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${
                            indicator.enabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">FORECAST START DATE</p>
                <div className="mt-3 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-darkText">
                      {monthNames[currentMonth]} {currentYear}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-300"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-300"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[11px] font-semibold text-gray-400">
                    {dayLabels.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
                    {calendarDays.map((cell, index) => {
                      const isToday =
                        cell.inMonth &&
                        cell.day === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear()
                      const isSelected = cell.inMonth && cell.day === selectedDate
                      return (
                        <button
                          key={`${cell.day}-${index}`}
                          type="button"
                          onClick={() => cell.inMonth && setSelectedDate(cell.day)}
                          className={`h-9 w-9 rounded-full transition ${
                            isSelected
                              ? 'bg-[#F0B429] text-darkText'
                              : isToday
                                ? 'bg-[#F0B429]/20 text-darkText'
                                : cell.inMonth
                                  ? 'text-darkText hover:bg-[#F0B429]/20'
                                  : 'text-gray-400'
                          }`}
                        >
                          {cell.day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#F0B429] px-4 py-4 text-sm font-bold text-darkText transition-transform hover:scale-105">
                <span className="text-base">✦</span>
                PREDICT NOW
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-darkText">AI Prediction Results</h2>
                  <p className="text-sm text-gray-500">BTC/USD Market Projection</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <span>↗</span>
                    Bullish
                  </span>
                  <span className="flex items-center gap-2 text-xs text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Prediction
                  </span>
                </div>
              </div>

              <div className="relative mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-gradient-to-br from-[#1b1b1b] via-[#2c2c2c] to-[#111111]">
                  <div className="text-center text-sm text-gray-300">
                    Candlestick Chart Placeholder
                  </div>
                </div>
                <div className="absolute right-6 top-6 rounded-full bg-[#F0B429] px-4 py-2 text-right text-xs font-semibold text-darkText">
                  <div className="text-[10px] uppercase tracking-[0.2em]">Target Projection</div>
                  <div className="text-sm font-bold">$68,432.50</div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">PREDICTED PRICE</p>
                  <div className="mt-2 text-3xl font-extrabold text-[#F0B429]">$72,410.00</div>
                  <p className="mt-1 text-sm text-emerald-600">↑ +8.4% Expected</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">CONFIDENCE SCORE</p>
                    <span className="text-sm font-bold text-[#F0B429]">94%</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 w-[94%] rounded-full bg-[#F0B429]" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Based on 1.2M historical data points</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">MARKET SENTIMENT</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0B429] text-darkText">●</span>
                    <span className="text-lg font-bold text-darkText">Strong Buy</span>
                  </div>
                  <p className="mt-2 text-xs italic text-gray-500">Neural Sentiment Score: 8.9/10</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">24H VOLUME</p>
                  <p className="mt-2 text-lg font-bold text-darkText">$34.2B</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">VOLATILITY INDEX</p>
                  <p className="mt-2 text-lg font-bold text-darkText">Medium</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">FEAR &amp; GREED</p>
                  <p className="mt-2 text-lg font-bold text-[#F0B429]">76 (Greed)</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">AI ACCURACY RATE</p>
                  <p className="mt-2 text-lg font-bold text-darkText">91.4%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </main>
  )
}
