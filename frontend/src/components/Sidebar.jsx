import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, PlusCircle, Zap, BarChart2, Bell, Trophy, User, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { label: 'Dashboard',   icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Add Data',    icon: PlusCircle,      to: '/add-data' },
    { label: 'Quick Check', icon: Zap,             to: '/quick-check' },
    { label: 'Reports',     icon: BarChart2,        to: '/reports' },
    { label: 'Eco Tips',    icon: Bell,             to: '/tips' },
    { label: 'Hall of Fame',icon: Trophy,           to: '/leaderboard' },
    { label: 'Profile',     icon: User,             to: '/profile' },
];

const Sidebar = () => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="neo-sidebar select-none">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-neo-border flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl bg-neo-green/10 border border-neo-green/40 flex items-center justify-center"
                    style={{ boxShadow: '0 0 12px rgba(0,255,136,0.2)' }}
                >
                    <span className="text-neo-green font-orbitron font-bold text-lg">E</span>
                </div>
                <div>
                    <div className="font-orbitron font-bold text-neo-text text-sm tracking-widest">ECOTRACKER</div>
                    <div className="text-neo-text-muted text-xs font-rajdhani tracking-widest uppercase">Neon-AI</div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map(({ label, icon: Icon, to }) => {
                    const active = pathname === to || (to === '/dashboard' && pathname === '/');
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`nav-link ${active ? 'active' : ''}`}
                        >
                            <Icon size={16} className={active ? 'text-neo-green' : ''} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 border-t border-neo-border pt-4">
                <button
                    onClick={handleLogout}
                    className="nav-link w-full text-red-500 hover:text-red-400 hover:bg-red-500/5"
                >
                    <LogOut size={16} />
                    <span>System Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
