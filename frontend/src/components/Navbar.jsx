import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Leaf, LogOut, User, History, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-eco-border-light dark:border-eco-border-dark px-8 py-4 flex items-center justify-between transition-colors duration-500">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-primary-light/10 border border-primary-light/20 flex items-center justify-center text-primary-light transition-transform group-hover:rotate-12">
                    <Leaf size={24} />
                </div>
                <span className="text-xl font-black font-inter text-text-light dark:text-text-dark tracking-tighter uppercase italic">
                    EcoTrack <span className="text-secondary-light">AI</span>
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 ml-12 flex-1">
                {['Dashboard', 'Add Data', 'History', 'Reports', 'Leaderboard'].map((item) => (
                    <Link 
                        key={item}
                        to={`/${item.toLowerCase().replace(' ', '-')}`} 
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary-light transition-colors relative group"
                    >
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-light transition-all group-hover:w-full"></span>
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-eco-border-light dark:border-eco-border-dark hover:border-primary-light/30 transition-all group"
                    title="Toggle Theme"
                >
                    {isDarkMode ? 
                        <Sun className="text-secondary-light group-hover:rotate-90 transition-transform" size={20} /> : 
                        <Moon className="text-text-muted group-hover:-rotate-12 transition-transform" size={20} />
                    }
                </button>

                {user ? (
                        <Link to="/profile" className="flex items-center gap-5 group">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-light dark:text-text-dark leading-none group-hover:text-primary-light transition-colors">{user.username}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary-light opacity-60">Verified Node</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary-light/20 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:border-primary-light transition-all shadow-sm">
                                {user.profile_image ? (
                                    <img src={`http://localhost:5000${user.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-text-muted" />
                                )}
                            </div>
                        </Link>
                ) : (
                    <div className="flex gap-6 items-center">
                        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary-light transition-colors">Login</Link>
                        <Link to="/register" className="btn-neo py-2.5 px-6 text-[10px]">Initialize Access</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
