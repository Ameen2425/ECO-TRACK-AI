import React, { useState } from 'react';
import { 
    Search, Bell, Sun, Moon, User, Settings, 
    LogOut, ChevronDown, Leaf, Menu 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_TITLES = {
    '/dashboard':            'Dashboard Overview',
    '/add-data':             'Add Emission Data',
    '/calculation-process':  'Calculation Breakdown',
    '/reports':              'Analytics & Reports',
    '/history':              'Emission History',
    '/leaderboard':          'Eco Leaderboard',
    '/profile':              'My Profile',
    '/settings':             'Settings',
    '/tips':                 'Sustainability Tips',
    '/quick-check':          'Quick Check',
};

const Topbar = ({ onMenuClick }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, user, profileImage } = useAuth();
    const { pathname } = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen,   setIsNotifOpen]   = useState(false);
    const [searchQuery,   setSearchQuery]   = useState('');
    const [hasNotif,      setHasNotif]      = useState(true);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const SEARCH_RESULTS = [
        { name: 'Dashboard Overview', path: '/dashboard', icon: <Leaf size={14} /> },
        { name: 'Add Transportation', path: '/add-data',  icon: <Leaf size={14} /> },
        { name: 'Analytics Reports',  path: '/reports',   icon: <Leaf size={14} /> },
        { name: 'Emission History',   path: '/history',   icon: <Leaf size={14} /> },
        { name: 'Leaderboard',        path: '/leaderboard', icon: <Leaf size={14} /> },
        { name: 'Account Settings',   path: '/settings',  icon: <Leaf size={14} /> },
        { name: 'Quick Eco Check',    path: '/quick-check', icon: <Leaf size={14} /> },
    ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const NOTIFICATIONS = [
        { id: 1, title: 'Database Synced',   desc: 'Your emission records are now perfectly synchronized.', time: 'Just now', type: 'success' },
        { id: 2, title: 'Eco Hero Status',   desc: 'You are in the top 5% of users this week!', time: '2h ago', type: 'info' },
        { id: 3, title: 'New Transport AI',  desc: 'Try the new detailed vehicle selection system.', time: '5h ago', type: 'info' },
    ];

    const title    = PAGE_TITLES[pathname] || 'EcoTrack AI';
    const initials = (user?.username || user?.name || 'A').split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2);

    return (
        <header className="sticky top-0 right-0 h-16 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-eco-border z-40 px-4 md:px-6 flex items-center justify-between transition-all duration-500">
            {/* Left */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all shrink-0"
                >
                    <Menu size={18} />
                </button>

                <div className="hidden lg:block shrink-0">
                    <h1 className="font-inter font-black text-base tracking-tight text-text-light dark:text-text-dark uppercase">
                        {title}
                    </h1>
                </div>

                <div className="relative max-w-xs w-full group hidden md:block ml-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" size={15} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        placeholder="Search eco-data..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-transparent focus:border-eco-green/30 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-inter text-xs"
                    />
                    
                    <AnimatePresence>
                        {isSearchFocused && searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-eco-border rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                            >
                                {SEARCH_RESULTS.length > 0 ? (
                                    SEARCH_RESULTS.map((res, i) => (
                                        <Link 
                                            key={i} 
                                            to={res.path}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-eco-green/5 text-xs text-text-muted hover:text-eco-green transition-all"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                {res.icon}
                                            </div>
                                            {res.name}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-text-muted text-center italic">No results found</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Theme */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all border border-transparent hover:border-eco-green/20"
                >
                    {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-analytics-blue" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setHasNotif(false); }}
                        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all border border-transparent ${isNotifOpen ? 'bg-eco-green/10 text-eco-green border-eco-green/20' : 'bg-gray-100 dark:bg-gray-800 text-text-muted hover:text-eco-green hover:border-eco-green/20'}`}
                    >
                        <Bell size={16} />
                        {hasNotif && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-eco-green rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-gray-900 border border-eco-border shadow-2xl z-20 py-2 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-eco-border flex items-center justify-between">
                                        <h3 className="font-bold text-xs">Notifications</h3>
                                        <span className="text-[10px] text-eco-green font-black uppercase tracking-widest">3 New</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {NOTIFICATIONS.map(notif => (
                                            <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border-b border-eco-border last:border-0 cursor-pointer">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-[11px]">{notif.title}</span>
                                                    <span className="text-[9px] text-text-muted">{notif.time}</span>
                                                </div>
                                                <p className="text-[10px] text-text-muted leading-relaxed">{notif.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-eco-border mt-1">
                                        <button className="w-full py-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-eco-green transition-all">
                                            View All Alerts
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-6 w-[1px] bg-eco-border hidden sm:block" />

                {/* Profile dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-eco-border"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-eco-green flex items-center justify-center shadow-sm text-white font-black text-xs shrink-0">
                            {profileImage ? (
                                <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="hidden md:flex flex-col items-start leading-none">
                            <span className="font-inter font-black text-xs tracking-tight">{user?.username || user?.name || 'User'}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-eco-green opacity-70 mt-0.5">Eco Hero</span>
                        </div>
                        <ChevronDown size={12} className={`text-text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-gray-900 border border-eco-border shadow-2xl z-20 py-2 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-eco-border mb-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-eco-green flex items-center justify-center text-white font-black text-sm shrink-0">
                                                {profileImage ? (
                                                    <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs truncate">{user?.name || user?.username || 'User'}</p>
                                                <p className="text-[9px] text-text-muted truncate">{user?.email || ''}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-eco-green hover:bg-eco-green/5 transition-all">
                                        <User size={14} /><span>My Profile</span>
                                    </Link>
                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-eco-green hover:bg-eco-green/5 transition-all">
                                        <Settings size={14} /><span>Settings</span>
                                    </Link>
                                    <div className="h-[1px] bg-eco-border my-1" />
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                                        <LogOut size={14} /><span>Logout</span>
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
