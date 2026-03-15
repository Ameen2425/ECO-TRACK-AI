import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, PlusCircle, Calculator, PieChart, History, 
    Trophy, User, Settings, LogOut, ChevronLeft, Leaf, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ className, isOpen, onClose }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();
    
    const navSections = [
        {
            label: 'Management',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: '#16A34A' },
                { name: 'Add Data', icon: PlusCircle, path: '/add-data', color: '#2563EB' },
                { name: 'Calculation', icon: Calculator, path: '/calculation-process', color: '#3B82F6' },
                { name: 'Analytics', icon: PieChart, path: '/reports', color: '#10B981' },
                { name: 'History', icon: History, path: '/history', color: '#6366F1' },
                { name: 'Rankings', icon: Trophy, path: '/leaderboard', color: '#F59E0B' },
                { name: 'Eco Tips', icon: Leaf, path: '/tips', color: '#10B981' },
            ]
        },
        {
            label: 'Account',
            items: [
                { name: 'Profile', icon: User, path: '/profile', color: '#8B5CF6' },
                { name: 'Settings', icon: Settings, path: '/settings', color: '#64748B' },
            ]
        }
    ];

    return (
        <motion.aside 
            initial={false}
            animate={{ 
                width: collapsed ? 80 : 280,
                x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (isOpen ? 0 : -280) : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:relative left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r border-eco-border z-50 flex flex-col shadow-2xl dark:shadow-none ${className || ''}`}
        >
            {/* Header / Logo Area */}
            <div className={`h-24 flex items-center px-6 transition-all duration-300 relative ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20 shrink-0">
                            <Leaf className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-inter font-black text-sm tracking-tighter uppercase italic text-text-light dark:text-text-dark">
                                Eco<span className="text-eco-green">Track</span> AI
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 text-text-muted">Intelligence OS</span>
                        </div>
                    </motion.div>
                )}
                
                {collapsed && (
                    <div className="w-10 h-10 rounded-xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/20">
                        <Leaf className="text-white" size={20} />
                    </div>
                )}

                {/* Collapse Toggle (Desktop) */}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-12 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-eco-border items-center justify-center text-text-muted hover:text-eco-green hover:border-eco-green transition-all shadow-md z-10"
                >
                    <ChevronLeft size={14} className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* Close Toggle (Mobile) */}
                <button 
                    onClick={onClose}
                    className="lg:hidden absolute right-4 top-8 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-red-500 transition-all shadow-sm"
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar py-4">
                {navSections.map((section, sIdx) => (
                    <div key={section.label} className="space-y-2">
                        {!collapsed && (
                            <div className="px-4 py-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 text-text-muted">
                                    {section.label}
                                </span>
                            </div>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                            ${isActive 
                                                ? 'bg-eco-green/10 text-eco-green font-black shadow-sm' 
                                                : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-text-light dark:hover:text-text-dark'
                                            }
                                            ${collapsed ? 'justify-center px-0' : ''}
                                        `}
                                    >
                                        <div className="relative z-10 flex items-center gap-3">
                                            <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                                            {!collapsed && (
                                                <span className="font-inter text-[11px] font-bold tracking-tight whitespace-nowrap">
                                                    {item.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Active Indicator Dot */}
                                        <AnimatePresence>
                                            {collapsed && (
                                                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-2xl">
                                                    {item.name}
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Background decoration for active */}
                                        <NavLink to={item.path} className={({isActive}) => isActive ? "absolute inset-0 bg-eco-green/5 pointer-events-none" : "hidden"} />
                                    </NavLink>
                                );
                            })}
                        </div>
                        {sIdx < navSections.length - 1 && collapsed && (
                            <div className="mx-4 h-[1px] bg-border opacity-50" />
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-eco-border/50 space-y-4">
                <button 
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-inter font-black text-[11px] uppercase tracking-widest ${collapsed ? 'justify-center px-0' : ''}`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!collapsed && <span>Terminate</span>}
                </button>
                
                {!collapsed && (
                    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border/40 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-eco-green/20 flex items-center justify-center text-eco-green animate-pulse">
                            <Zap size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-text-light dark:text-text-dark uppercase tracking-widest">Premium OS</span>
                            <span className="text-[8px] font-bold text-text-muted uppercase">v1.2.4 Active</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
