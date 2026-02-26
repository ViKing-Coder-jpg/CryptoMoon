import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

const Navbar = ({ isDark, toggleTheme }) => {
    return (
        <header className="h-20 flex items-center justify-between px-10 bg-white/80 dark:bg-dark-gray/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center gap-3">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/30">
                    B
                </div>
                <div className="flex flex-col leading-tight">
                    <strong className="text-xl tracking-tight text-dark-gray dark:text-white">CryptoMoon</strong>
                    <span className="text-[10px] tracking-[2px] text-muted-gray uppercase dark:text-gray-400">Luxury AI Fintech</span>
                </div>
            </div>

            <nav className="flex gap-8">
                <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-opacity hover:opacity-70 ${isActive ? 'text-dark-gray dark:text-white' : 'text-muted-gray dark:text-gray-400'}`}>Home</NavLink>
                <NavLink to="/predictions" className={({ isActive }) => `text-sm font-medium transition-opacity hover:opacity-70 ${isActive ? 'text-dark-gray dark:text-white' : 'text-muted-gray dark:text-gray-400'}`}>Predictions</NavLink>
                <NavLink to="/about" className="text-sm font-medium text-muted-gray dark:text-gray-400 hover:opacity-70">About</NavLink>
                <NavLink to="/dashboard" className="text-sm font-medium text-muted-gray dark:text-gray-400 hover:opacity-70">Dashboard</NavLink>
            </nav>

            <div className="flex items-center gap-5">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-dark-gray dark:text-white"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="text-sm font-medium text-dark-gray dark:text-white hover:opacity-70">Sign In</button>
                <button className="bg-primary text-dark-gray px-6 py-2 rounded-full font-bold text-sm shadow-md hover:scale-[1.02] transition-transform">
                    Get Started
                </button>
            </div>
        </header>
    );
};

export default Navbar;
