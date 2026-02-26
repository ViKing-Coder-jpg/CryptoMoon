import React, { useState } from 'react';
import {
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Zap,
    Activity,
    BarChart3,
    TrendingUp
} from 'lucide-react';

const Predictions = () => {
    const [timeframe, setTimeframe] = useState('1D');
    const [indicators, setIndicators] = useState({
        sma: true,
        rsi: false,
        macd: false
    });

    return (
        <div className="max-w-[1440px] mx-auto px-10 py-10">
            <section className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-dark-gray mb-3 tracking-tighter">
                    Bitcoin Price <span className="text-primary italic">Prediction</span> Dashboard
                </h1>
                <p className="text-muted-gray text-lg">Advanced AI Forecasting Engine utilizing neural networks and sentiment analysis.</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-10">
                {/* Prediction Parameters Sidebar */}
                <aside className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 flex flex-col gap-8 h-fit">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Settings className="text-primary" size={24} />
                            <h3 className="text-xl font-bold text-dark-gray">Prediction Parameters</h3>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => <span key={i} className="w-1 h-5 bg-gray-100 rounded-full"></span>)}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Forecasting Timeframe</label>
                        <div className="flex bg-gray-50 p-1 rounded-full gap-1">
                            {['1D', '7D', '30D'].map(t => (
                                <button
                                    key={t}
                                    className={`flex-1 py-3 rounded-full font-bold text-xs transition-all ${timeframe === t ? 'bg-white text-dark-gray shadow-sm' : 'text-muted-gray hover:opacity-70'}`}
                                    onClick={() => setTimeframe(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Technical Indicators</label>
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'sma', label: 'Moving Average (SMA)', active: indicators.sma, disabled: false },
                                { id: 'rsi', label: 'Relative Strength (RSI)', active: indicators.rsi, disabled: true },
                                { id: 'macd', label: 'MACD Convergence', active: indicators.macd, disabled: true },
                            ].map(indicator => (
                                <div key={indicator.id} className={`flex justify-between items-center p-4 bg-gray-50 rounded-2xl ${indicator.disabled ? 'opacity-50' : ''}`}>
                                    <span className="text-sm font-semibold text-dark-gray">{indicator.label}</span>
                                    <button
                                        onClick={() => !indicator.disabled && setIndicators({ ...indicators, [indicator.id]: !indicator.active })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${indicator.active ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${indicator.active ? 'left-5.5' : 'left-0.5'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Forecast Start Date</label>
                        <div className="bg-gray-50 p-5 rounded-3xl">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <strong className="text-sm font-bold text-dark-gray">October 2023</strong>
                                <div className="flex gap-4 text-muted-gray">
                                    <ChevronLeft size={16} className="cursor-pointer" />
                                    <ChevronRight size={16} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="grid grid-cols-7 text-center gap-2 text-[10px] font-bold">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-gray-300">{d}</span>)}
                                {[28, 29, 30, 1, 2, 3, 4].map(day => <span key={day} className="py-1 text-gray-300">{day}</span>)}
                                <span className="py-1 bg-primary text-dark-gray rounded-full flex items-center justify-center font-black">5</span>
                                {[6, 7, 8, 9, 10, 11].map(day => <span key={day} className="py-1 text-dark-gray">{day}</span>)}
                            </div>
                        </div>
                    </div>

                    <button className="bg-primary text-dark-gray w-full py-5 rounded-full font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <Sparkles size={18} /> Predict Now
                    </button>
                </aside>

                {/* AI Prediction Results */}
                <section className="bg-white rounded-[48px] border border-gray-100 shadow-xl p-12 flex flex-col gap-10">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-3xl font-black text-dark-gray tracking-tight">AI Prediction Results</h2>
                            <span className="text-sm font-medium text-muted-gray">BTC/USD Market Projection</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <span className="bg-emerald-50 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} /> Bullish
                            </span>
                            <span className="text-[10px] font-bold text-muted-gray flex items-center gap-2">
                                Live Prediction <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_0_5px_rgba(255,204,0,0.2)]"></span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-[40px] p-1 border border-gray-100 relative min-h-[400px] overflow-hidden flex items-center justify-center">
                        {/* Target Marker */}
                        <div className="absolute top-20 right-32 bg-primary p-4 rounded-2xl shadow-2xl z-10 flex flex-col -translate-y-1/2">
                            <span className="text-[9px] font-black text-dark-gray/60 uppercase">Target Projection</span>
                            <span className="text-xl font-black text-dark-gray">$68,432.50</span>
                            <div className="absolute bottom-[-100px] left-1/2 w-[2px] h-[100px] bg-primary"></div>
                        </div>

                        {/* Custom SVG Chart */}
                        <svg viewBox="0 0 800 400" className="w-full h-full p-10">
                            <path d="M0,350 Q200,320 300,300 T500,200 T800,50" fill="none" stroke="#FFCC00" strokeWidth="6" strokeLinecap="round" />
                            <path d="M0,350 Q200,320 300,300 T500,200 T800,50 L800,400 L0,400 Z" fill="url(#chartGrad)" opacity="0.15" />
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FFCC00" />
                                    <stop offset="100%" stopColor="white" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10 border-t border-gray-50">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Predicted Price</label>
                            <div className="text-4xl font-black text-primary">$72,410.00</div>
                            <div className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">↑ +8.4% Expected</div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Confidence Score</label>
                                <span className="text-sm font-black text-dark-gray">94%</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden my-2">
                                <div className="h-full bg-primary" style={{ width: '94%' }}></div>
                            </div>
                            <span className="text-[10px] font-medium text-muted-gray">Based on 1.2M historical data points</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">Market Sentiment</label>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                    <Zap size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-dark-gray">Strong Buy</span>
                                    <span className="text-[10px] font-medium text-muted-gray">Neural Sentiment Score: 8.9/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                {[
                    { label: '24H Volume', value: '$34.2B' },
                    { label: 'Volatility Index', value: 'Medium' },
                    { label: 'Fear & Greed', value: '76 (Greed)', color: 'text-primary' },
                    { label: 'AI Accuracy Rate', value: '91.4%' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center flex flex-col gap-3">
                        <label className="text-[10px] font-bold text-muted-gray uppercase tracking-widest">{stat.label}</label>
                        <strong className={`text-2xl font-black ${stat.color || 'text-dark-gray'}`}>{stat.value}</strong>
                    </div>
                ))}
            </section>

            <footer className="mt-20 pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-muted-gray uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-primary" /> CryptoMoon Secure AI V2.4
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-dark-gray transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-dark-gray transition-colors">Terms of Forecast</a>
                    <a href="#" className="hover:text-dark-gray transition-colors">API Access</a>
                </div>
                <div>
                    © 2023 CryptoMoon AI Fintech. All predictions are probabilistic models.
                </div>
            </footer>
        </div>
    );
};

export default Predictions;
