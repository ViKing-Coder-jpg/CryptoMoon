import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ isDark, toggleTheme }) => {
    return (
        <div className="min-h-screen bg-bg-subtle transition-colors duration-300">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
