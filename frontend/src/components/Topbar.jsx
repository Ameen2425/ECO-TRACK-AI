import React, { useState } from 'react';
import { 
    Search, Bell, Sun, Moon, User, Settings, 
    LogOut, ChevronDown, Shield, Leaf, Menu 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
    '/dashboard': 'Dashboard Overview',
    '/add-data': 'Add New Emission',
    '/calculation-process': 'Calculation Breakdown',
    '/reports': 'Environmental Analytics',
    '/history': 'Emission History',
    '/leaderboard': 'Eco Leaderboard',
    '/profile': 'Profile Settings',
    '/settings': 'Platform Settings',
    '/tips': 'Sustainability Tips',
};

const Topbar = ({ onMenuClick }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const { pathname } = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const title = PAGE_TITLES[pathname] || 'EcoTrack AI';

    return (
        <header className="sticky top-0 right-0 h-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-eco-border z-40 px-4 md:px-8 flex items-center justify-between transition-all duration-500">
            {/* Left: Search & context */}
            <div className="flex items-center gap-4 md:gap-8 flex-1">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:block">
                    <h1 className="font-inter font-black text-lg tracking-tight text-text-light dark:text-text-dark uppercase">
                        {title}
                    </h1>
                </div>

                <div className="relative max-w-md w-full group hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your eco-data..." 
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:border-eco-green/30 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-inter text-sm"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all shadow-sm border border-transparent hover:border-eco-green/20"
                >
                    {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-analytics-blue" />}
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all shadow-sm border border-transparent hover:border-eco-green/20">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-eco-green rounded-full border-2 border-background-light dark:border-background-dark" />
                </button>

                <div className="h-8 w-[1px] bg-border mx-2" />

                {/* User Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-eco-border"
                    >
                        <div className="w-8 h-8 rounded-lg bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20 text-white font-black text-xs">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="hidden md:flex flex-col items-start leading-none">
                            <span className="font-inter font-black text-xs tracking-tight">{user?.username || 'Ameen'}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-eco-green opacity-70">Eco Hero</span>
                        </div>
                        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-eco-border shadow-2xl z-20 py-2"
                                >
                                    <div className="px-4 py-3 border-b border-eco-border mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Signed in as</p>
                                        <p className="font-inter font-bold text-sm truncate">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-eco-green hover:bg-eco-green/5 transition-all">
                                        <User size={16} />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-eco-green hover:bg-eco-green/5 transition-all">
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </Link>
                                    <div className="h-[1px] bg-border my-2" />
                                    <button 
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
