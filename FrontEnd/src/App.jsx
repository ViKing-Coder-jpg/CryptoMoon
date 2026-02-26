import React, { useState } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  PieChart,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  History,
  Info
} from 'lucide-react';
import './App.css';

const App = () => {
  const [timeframe, setTimeframe] = useState('1D');
  const [indicators, setIndicators] = useState({
    sma: true,
    rsi: false,
    macd: false
  });

  return (
    <div className="dashboard-wrapper">
      <header>
        <div className="logo">
          <div className="logo-icon">B</div>
          <div className="logo-text">
            <strong>CryptoMoon</strong>
            <span>LUXURY AI FINTECH</span>
          </div>
        </div>

        <nav>
          <a href="#" className="active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="#"><TrendingUp size={18} /> Market Analysis</a>
          <a href="#"><PieChart size={18} /> Portfolio</a>
        </nav>

        <div className="header-actions">
          <button className="icon-btn"><Bell size={20} /></button>
          <div className="user-profile">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="hero-section">
          <h1>Bitcoin Price <span className="text-gold">Prediction</span> Dashboard</h1>
          <p>Advanced AI Forecasting Engine utilizing neural networks and sentiment analysis.</p>
        </section>

        <div className="main-grid">
          {/* Prediction Parameters Sidebar */}
          <aside className="card prediction-params">
            <div className="card-header">
              <div className="header-title">
                <Settings className="text-gold" size={24} />
                <h3>Prediction Parameters</h3>
              </div>
              <div className="header-decoration">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="param-group">
              <label>FORECASTING TIMEFRAME</label>
              <div className="timeframe-selector">
                {['1D', '7D', '30D'].map(t => (
                  <button
                    key={t}
                    className={timeframe === t ? 'active' : ''}
                    onClick={() => setTimeframe(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="param-group">
              <label>TECHNICAL INDICATORS</label>
              <div className="indicator-toggles">
                <div className="toggle-item">
                  <span>Moving Average (SMA)</span>
                  <label className="switch">
                    <input type="checkbox" checked={indicators.sma} onChange={() => setIndicators({ ...indicators, sma: !indicators.sma })} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="toggle-item disabled">
                  <span>Relative Strength (RSI)</span>
                  <label className="switch">
                    <input type="checkbox" checked={indicators.rsi} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="toggle-item disabled">
                  <span>MACD Convergence</span>
                  <label className="switch">
                    <input type="checkbox" checked={indicators.macd} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="param-group calendar-group">
              <label>FORECAST START DATE</label>
              <div className="mini-calendar">
                <div className="calendar-header">
                  <strong>October 2023</strong>
                  <div className="cal-nav">
                    <ChevronLeft size={14} />
                    <ChevronRight size={14} />
                  </div>
                </div>
                <div className="calendar-grid">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  <span className="muted">28</span><span className="muted">29</span><span className="muted">30</span>
                  <span>1</span><span>2</span><span>3</span><span>4</span>
                  <span className="selected">5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                </div>
              </div>
            </div>

            <button className="btn-primary full-width">
              <Sparkles size={20} /> PREDICT NOW
            </button>
          </aside>

          {/* AI Prediction Results */}
          <section className="card prediction-results">
            <div className="card-header-flex">
              <div>
                <h2>AI Prediction Results</h2>
                <span className="subtitle">BTC/USD Market Projection</span>
              </div>
              <div className="badges">
                <span className="badge bullish"><Activity size={12} /> Bullish</span>
                <span className="badge-live">Live Prediction <span className="dot"></span></span>
              </div>
            </div>

            <div className="chart-area">
              <div className="chart-placeholder">
                <div className="target-marker">
                  <span className="label">TARGET PROJECTION</span>
                  <span className="value">$68,432.50</span>
                </div>
                {/* Simplified Chart SVG */}
                <svg viewBox="0 0 800 400" className="main-svg">
                  <path d="M0,350 Q200,320 300,300 T500,200 T800,50" fill="none" stroke="#FFD700" strokeWidth="4" />
                  <path d="M0,350 Q200,320 300,300 T500,200 T800,50 L800,400 L0,400 Z" fill="url(#chartGradient)" opacity="0.1" />
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="results-footer">
              <div className="metric">
                <label>PREDICTED PRICE</label>
                <div className="value-gold">$72,410.00</div>
                <div className="change positive">↑ +8.4% Expected</div>
              </div>
              <div className="metric wide">
                <div className="flex-between">
                  <label>CONFIDENCE SCORE</label>
                  <span className="value-percent">94%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '94%' }}></div>
                </div>
                <span className="subtext">Based on 1.2M historical data points</span>
              </div>
              <div className="metric">
                <label>MARKET SENTIMENT</label>
                <div className="sentiment-display">
                  <Zap size={24} className="text-gold" />
                  <div>
                    <strong>Strong Buy</strong>
                    <span className="subtext">Neural Sentiment Score: 8.9/10</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <label>24H VOLUME</label>
            <strong>$34.2B</strong>
          </div>
          <div className="stat-card">
            <label>VOLATILITY INDEX</label>
            <strong>Medium</strong>
          </div>
          <div className="stat-card">
            <label>FEAR & GREED</label>
            <strong className="text-gold">76 (Greed)</strong>
          </div>
          <div className="stat-card">
            <label>AI ACCURACY RATE</label>
            <strong>91.4%</strong>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-left">
          <Sparkles size={14} /> CRYPTOMOON SECURE AI V2.4
        </div>
        <div className="footer-links">
          <a href="#">PRIVACY POLICY</a>
          <a href="#">TERMS OF FORECAST</a>
          <a href="#">API ACCESS</a>
        </div>
        <div className="footer-copy">
          © 2023 CryptoMoon AI Fintech. All predictions are probabilistic models.
        </div>
      </footer>
    </div>
  );
};

export default App;
