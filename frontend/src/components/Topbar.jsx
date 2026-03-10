import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
    '/dashboard': 'Dashboard',
    '/add-data': 'Add Data',
    '/calculation-process': 'Quick Check',
    '/reports': 'Reports',
    '/tips': 'Eco Tips',
    '/leaderboard': 'Hall of Fame',
    '/profile': 'Profile',
};

const Topbar = () => {
    const { pathname } = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user } = useAuth();

    const title = PAGE_TITLES[pathname] || 'Dashboard';
    const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'EX';

    return (
        <header className="neo-topbar">
            <h1 className="font-rajdhani font-bold uppercase tracking-[0.25em] text-neo-text text-lg">
                {title}
            </h1>

            <div className="flex items-center gap-5">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-neo-border bg-neo-card hover:border-neo-green/50 hover:text-neo-green text-neo-text-muted transition-all duration-200"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="font-rajdhani font-semibold text-sm text-neo-text uppercase tracking-wide">
                            {user?.username || 'Guest'}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="pulse-dot w-1.5 h-1.5"></span>
                            <span className="text-neo-green text-xs font-rajdhani tracking-widest uppercase">Status: Protected</span>
                        </div>
                    </div>
                    <div
                        className="w-9 h-9 rounded-lg bg-neo-green/20 border border-neo-green/40 flex items-center justify-center font-orbitron font-bold text-neo-green text-xs"
                    >
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
