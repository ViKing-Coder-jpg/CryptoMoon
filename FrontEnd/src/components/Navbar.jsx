import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <header className="h-20 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30">
                    B
                </div>
                <div className="flex flex-col leading-tight">
                    <strong className="text-xl tracking-tight text-dark-gray">CryptoMoon</strong>
                    <span className="text-[10px] tracking-[2px] text-muted-gray uppercase">Luxury AI Fintech</span>
                </div>
            </div>

            <nav className="flex gap-8">
                <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-opacity hover:opacity-70 ${isActive ? 'text-dark-gray' : 'text-muted-gray'}`}>Home</NavLink>
                <NavLink to="/predictions" className={({ isActive }) => `text-sm font-medium transition-opacity hover:opacity-70 ${isActive ? 'text-dark-gray' : 'text-muted-gray'}`}>Predictions</NavLink>
                <NavLink to="/about" className="text-sm font-medium text-muted-gray hover:opacity-70">About</NavLink>
                <NavLink to="/dashboard" className="text-sm font-medium text-muted-gray hover:opacity-70">Dashboard</NavLink>
            </nav>

            <div className="flex items-center gap-5">
                <button className="text-sm font-medium text-dark-gray hover:opacity-70">Sign In</button>
                <button className="bg-primary text-dark-gray px-6 py-2 rounded-full font-bold text-sm shadow-md hover:scale-[1.02] transition-transform">
                    Get Started
                </button>
            </div>
        </header>
    );
};

export default Navbar;
