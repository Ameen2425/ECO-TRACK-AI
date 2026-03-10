import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Leaf, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav px-8 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group transition-all duration-300">
                <Leaf className="text-eco-green w-8 h-8 group-hover:rotate-12 transition-transform" />
                <span className="text-2xl font-bold font-poppins text-eco-text-light dark:text-eco-text-dark tracking-tight">
                    EcoTrack <span className="text-eco-green">AI</span>
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 ml-12 flex-1">
                <Link to="/dashboard" className="text-eco-text-light/70 dark:text-eco-text-dark/70 hover:text-eco-green dark:hover:text-eco-green font-medium transition-colors relative group">
                    Analytics
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-eco-green transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/add-data" className="text-eco-text-light/70 dark:text-eco-text-dark/70 hover:text-eco-green dark:hover:text-eco-green font-medium transition-colors relative group">
                    Track Emissions
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-eco-green transition-all group-hover:w-full"></span>
                </Link>
                <Link to="/leaderboard" className="text-eco-text-light/70 dark:text-eco-text-dark/70 hover:text-eco-green dark:hover:text-eco-green font-medium transition-colors relative group">
                    Leaderboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-eco-green transition-all group-hover:w-full"></span>
                </Link>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-eco-dark-card border border-transparent dark:border-white/5 hover:bg-eco-green/10 dark:hover:bg-eco-dark-accent/20 transition-all duration-300 group"
                    title="Toggle Theme"
                >
                    {isDarkMode ? 
                        <Sun className="text-eco-green group-hover:rotate-90 transition-transform" size={20} /> : 
                        <Moon className="text-eco-text-light group-hover:-rotate-12 transition-transform" size={20} />
                    }
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-eco-text-light dark:text-eco-text-dark">Hello, {user.username}</span>
                        <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4 items-center">
                        <Link to="/login" className="font-medium text-eco-text-light dark:text-eco-text-dark hover:text-eco-green dark:hover:text-eco-green transition-colors">Login</Link>
                        <Link to="/register" className="btn-eco py-2 px-4 text-sm">Join Now</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
