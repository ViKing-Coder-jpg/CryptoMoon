import React from 'react';
import { Sparkles, Zap, TrendingUp, History, Info, Share2, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="max-w-[1440px] mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col gap-8">
                    <div className="bg-primary/10 text-primary-hover px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase self-start">
                        Next-Gen AI Forecasting
                    </div>
                    <h1 className="text-7xl font-extrabold leading-[1.1] text-dark-gray tracking-tighter">
                        Predict Bitcoin.<br />
                        <span className="text-primary italic">Ride the Future.</span>
                    </h1>
                    <p className="text-muted-gray text-lg leading-relaxed max-w-md">
                        Harness the power of neural networks for institutional-grade Bitcoin price forecasting. Real-time analytics for the modern digital asset explorer.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/predictions" className="bg-primary text-dark-gray px-10 py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2 uppercase tracking-wide">
                            Start Predicting
                        </Link>
                        <button className="border-2 border-primary text-dark-gray px-10 py-4 rounded-full font-bold hover:bg-primary/5 transition-colors uppercase tracking-wide">
                            View Live Charts
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <img
                        src="https://images.unsplash.com/photo-1621416848440-2369c1794695?q=80&w=1000&auto=format&fit=crop"
                        alt="Bitcoin Future"
                        className="relative rounded-[40px] shadow-2xl border-2 border-white/50"
                    />
                </div>
            </section>

            {/* Premium Intelligence Section */}
            <section className="bg-[#F9FAFB] py-24">
                <div className="max-w-[1440px] mx-auto px-10 text-center flex flex-col items-center gap-4 mb-16">
                    <h2 className="text-4xl font-black text-dark-gray">Premium Intelligence</h2>
                    <p className="text-muted-gray text-lg">Advanced analytical tools for high-precision decision making.</p>
                </div>

                <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { icon: <Sparkles className="text-primary" />, title: 'AI Predictions', desc: 'Deep learning models processing 200+ on-chain metrics hourly.' },
                        { icon: <Zap className="text-primary" />, title: 'Real-Time Data', desc: 'Low-latency data streams from top global exchanges.' },
                        { icon: <TrendingUp className="text-primary" />, title: 'Indicator Insights', desc: 'Proprietary technical signals refined by algorithmic history.' },
                        { icon: <History className="text-primary" />, title: 'Historical Analysis', desc: 'Backtested performance reports across multiple bull cycles.' },
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-xl hover:-translate-y-2 transition-all group">
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                                <span className="group-hover:text-white transition-colors">{feature.icon}</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xl font-bold text-dark-gray">{feature.title}</h3>
                                <p className="text-muted-gray text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Live Market Status Section */}
            <section className="py-24 bg-white">
                <div className="max-w-[1000px] mx-auto px-10">
                    <div className="bg-white rounded-[48px] shadow-2xl border border-gray-100 p-16 flex flex-col md:flex-row items-center gap-16 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                        <div className="flex-1 flex flex-col gap-6 relative">
                            <div className="bg-primary/10 text-primary-hover px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase self-start">
                                Live Market Status
                            </div>
                            <h2 className="text-4xl font-black text-dark-gray">Bitcoin (BTC)</h2>
                            <div className="flex items-baseline gap-4">
                                <span className="text-6xl font-black text-dark-gray">$68,432.10</span>
                                <span className="text-green-500 font-bold flex items-center gap-1"><TrendingUp size={18} /> +3.24%</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                                    <span className="text-[10px] text-muted-gray uppercase font-bold block mb-1">24H Low</span>
                                    <span className="text-lg font-bold">$66,120</span>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100">
                                    <span className="text-[10px] text-muted-gray uppercase font-bold block mb-1">24H High</span>
                                    <span className="text-lg font-bold">$69,500</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full h-64 relative">
                            {/* Dummy Wave Chart Visual */}
                            <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-2xl">
                                <path d="M0,150 Q50,130 100,140 T200,100 T300,120 T400,20" fill="none" stroke="#FFCC00" strokeWidth="8" strokeLinecap="round" />
                                <path d="M0,150 Q50,130 100,140 T200,100 T300,120 T400,20 L400,200 L0,200 Z" fill="url(#grad)" opacity="0.1" />
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FFCC00" />
                                        <stop offset="100%" stopColor="white" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="flex justify-between mt-4 px-2">
                                {['00:00', '06:00', '12:00', '18:00', '24:00'].map(t => (
                                    <span key={t} className="text-[10px] font-bold text-gray-400">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-[1440px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 grayscale opacity-70">
                        <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg">B</div>
                        <strong className="text-lg tracking-tight text-dark-gray">CryptoMoon</strong>
                    </div>
                    <div className="text-xs text-muted-gray font-medium uppercase tracking-widest">
                        © 2024 CryptoMoon Predictive Labs. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-primary">
                        <Globe size={20} className="cursor-pointer hover:opacity-70" />
                        <Share2 size={20} className="cursor-pointer hover:opacity-70" />
                        <Mail size={20} className="cursor-pointer hover:opacity-70" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
