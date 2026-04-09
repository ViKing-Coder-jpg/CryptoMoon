import { useEffect, useMemo, useState } from 'react'
import { FiSettings, FiSliders } from 'react-icons/fi'
import { api } from '../../functions'
import BTCCandleChart from '../components/Charts'
import { useTitle } from '../hooks/useTitle.js'

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
  useTitle('Predictions')
  const [xgb, setXgb] = useState(true)
  const [lstm, setLstm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())
  const [pred, setPred] = useState(null)
  const [predictedInsights, setPredictedInsights] = useState(null)

  const today = new Date()

  useEffect(() => {
    if (!pred) return
    const returnPct = pred.data.prediction_return ? pred.data.prediction_return : 0
    const price = pred.data.prediction_price ? pred.data.prediction_price : 0

    // Derive sentiment from predicted return
    let sentiment, sentimentScore
    if (returnPct > 5) {
      sentiment = 'Strong Buy'
      sentimentScore = (8 + Math.min(returnPct / 10, 2)).toFixed(1)
    } else if (returnPct > 1) {
      sentiment = 'Buy'
      sentimentScore = (6 + returnPct / 5).toFixed(1)
    } else if (returnPct > -1) {
      sentiment = 'Neutral'
      sentimentScore = '5.0'
    } else if (returnPct > -5) {
      sentiment = 'Sell'
      sentimentScore = (4 + returnPct / 5).toFixed(1)
    } else {
      sentiment = 'Strong Sell'
      sentimentScore = (2 + Math.max(returnPct / 10, -2)).toFixed(1)
    }

    setPredictedInsights({
      price: price.toFixed(2),
      returnPct: returnPct.toFixed(2),
      isPositive: returnPct >= 0,
      sentiment,
      sentimentScore,
      model: pred.data.model?.toUpperCase(),
      date: pred.data.date,
    })

  }, [pred])

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


  const indicators = [
    {
      label: 'Model 1 (XGBoost)',
      enabled: xgb,
      toggle: () => {
        setXgb((prev) => !prev)
        setLstm(false)
      },
    },
    {
      label: 'Model 2 (LSTM)',
      enabled: lstm,
      toggle: () => {
        setLstm((prev) => !prev)
        setXgb(false)
      },
    },
  ]

  const handlePredictions = async () => {
    let model
    if (xgb == true && lstm == false) {
      model = 'xgb'
    } else if (xgb == false && lstm == true) {
      model = 'lstm'
    } else {
      console.log('Select A model first')
      return
    }
    try {
      const predict = await api.get(`/predict?date=${`${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`}&model_use=${model}`)
      setPred(predict)
    } catch (error) {
      console.log('Error in Prediction \n', error)
    }
  }

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
                  <FiSliders className="h-5 w-5" />
                  <span className="text-lg font-bold">Prediction Parameters</span>
                </div>
                <FiSettings className="h-5 w-5 text-gray-400" />
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">MODEL SELECTION</p>
                <div className="mt-3 space-y-3">
                  {indicators.map((indicator) => (
                    <div key={indicator.label} className="flex items-center justify-between rounded-full bg-[#FBFBFB] px-4 py-3">
                      <span className={`text-sm ${indicator.enabled ? 'font-semibold text-darkText' : 'text-gray-500'}`}>
                        {indicator.label}
                      </span>
                      <button
                        type="button"
                        onClick={indicator.toggle}
                        className={`flex h-6 w-12 items-center rounded-full p-0.5 transition-colors ${indicator.enabled ? 'bg-[#F0B429]' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${indicator.enabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">FORECAST DATE</p>
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
                    {dayLabels.map((day, index) => (
                      <span key={index}>{day}</span>
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

                      // Block anything from day-after-tomorrow onwards
                      const tomorrow = new Date(today)
                      tomorrow.setDate(today.getDate() + 1)
                      const cellDate = new Date(currentYear, currentMonth, cell.day)
                      const isFuture = cell.inMonth && cellDate > tomorrow

                      return (
                        <button
                          key={`${cell.day}-${index}`}
                          type="button"
                          disabled={isFuture}
                          onClick={() => !isFuture && cell.inMonth && setSelectedDate(cell.day)}
                          className={`h-9 w-9 rounded-full transition ${isFuture
                            ? 'cursor-not-allowed opacity-30 blur-[1px]'
                            : isSelected
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

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#F0B429] px-4 py-4 text-sm font-bold text-darkText transition-transform hover:scale-105" onClick={handlePredictions}>
                <span className="text-base"></span>
                PREDICT NOW
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-darkText">AI Prediction Results</h2>
                  <p className="text-sm text-gray-500">BTC/USD Market Projection (90 days)</p>
                </div>
                <div className="flex items-center gap-3">
                  {predictedInsights && (
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${predictedInsights.isPositive
                      ? 'border-emerald-300 text-emerald-600'
                      : 'border-red-300 text-red-500'
                      }`}>
                      <span>{predictedInsights.isPositive ? '↗' : '↘'}</span>
                      {predictedInsights.isPositive ? 'Bullish' : 'Bearish'}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-xs text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Prediction
                  </span>
                </div>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#1b1b1b] via-[#2c2c2c] to-[#111111]">
                  <BTCCandleChart />
                </div>
              </div>

              {predictedInsights ? (
                <div>
                  <div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">PREDICTED PRICE</p>
                        <div className="mt-2 text-3xl font-extrabold text-[#F0B429]">
                          {`$${predictedInsights.price}`}
                        </div>
                        <p className={`mt-1 text-sm ${predictedInsights?.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {predictedInsights
                            ? `${predictedInsights.isPositive ? '↑' : '↓'} ${predictedInsights.isPositive ? '+' : ''}${predictedInsights.returnPct}% Expected`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">PREDICTED RETURN</p>
                        <div className={`mt-2 text-3xl font-extrabold ${predictedInsights?.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {predictedInsights ? `${predictedInsights.isPositive ? '+' : ''}${predictedInsights.returnPct}%` : '—'}
                        </div>
                        <p className="mt-1 text-xs  text-gray-500">vs previous close</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">MARKET SENTIMENT</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${predictedInsights?.isPositive ? 'bg-emerald-600' : 'bg-red-500'} text-white`}>●</span>
                          <span className="text-lg font-bold text-darkText">{predictedInsights?.sentiment ?? '—'}</span>
                        </div>
                        <p className="mt-2 text-xs italic text-gray-500">
                          Neural Sentiment Score: {predictedInsights?.sentimentScore ?? '—'}/10
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">MODEL USED</p>
                        <p className="mt-2 text-lg font-bold text-darkText">{predictedInsights?.model ?? '—'}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">FORECAST DATE</p>
                        <p className="mt-2 text-lg font-bold text-darkText">{predictedInsights?.date ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : <div></div>}
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
