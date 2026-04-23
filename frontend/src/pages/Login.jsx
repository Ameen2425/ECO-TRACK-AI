import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Lock, Mail, Smartphone, AlertCircle, LogIn, 
    Shield, Activity, Leaf, ArrowRight, Sparkles,
    ShieldCheck, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import loginHero from '../assets/login-hero.png';

const Login = () => {
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', form);
            login(res.data.access_token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center p-4">
            {/* Centered Glass Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-xl mx-auto"
            >
                <div className="bg-white/70 dark:bg-[#0F172A]/80 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-6 sm:p-10 md:p-14 space-y-8 sm:space-y-10">
                        
                        {/* Branding Header */}
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="flex flex-col items-center text-center space-y-4 sm:space-y-6"
                        >
                            <motion.div 
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-eco-green flex items-center justify-center shadow-xl shadow-eco-green/40 cursor-pointer"
                            >
                                <Leaf className="text-white" size={32} />
                            </motion.div>
                            <div className="space-y-1">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">
                                    ECO<span className="text-eco-green">TRACK</span>
                                </h2>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-text-muted opacity-70">Intelligence Access Node</p>
                            </div>
                        </motion.div>

                        {/* Login Form */}
                        <div className="space-y-6 sm:space-y-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Initialize Session</h3>
                                <p className="text-[10px] sm:text-xs text-text-muted font-medium mt-1">Please enter your credentials to connect.</p>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold"
                                    >
                                        <AlertCircle size={16} />
                                        <span className="flex-1">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-2"
                                >
                                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Identity Vector</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors">
                                            {form.identifier.includes('@') ? <Mail size={18} /> : <Smartphone size={18} />}
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Email or System ID..."
                                            value={form.identifier}
                                            onChange={e => setForm({...form, identifier: e.target.value})}
                                            required
                                            className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Security Key</label>
                                        <button type="button" className="text-[8px] sm:text-[9px] font-black text-eco-green hover:underline uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Recovery Path</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={e => setForm({...form, password: e.target.value})}
                                            required
                                            className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                        />
                                    </div>
                                </motion.div>

                                <motion.button 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-eco-green text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl shadow-eco-green/20 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
                                >
                                    {loading ? <Activity size={18} className="animate-spin" /> : <LogIn size={18} />}
                                    <span>{loading ? 'Authenticating...' : 'Establish Session'}</span>
                                </motion.button>
                            </form>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="pt-6 border-t border-eco-border dark:border-white/10 text-center"
                            >
                                <p className="text-text-muted text-[10px] sm:text-[11px] font-bold">
                                    New Intelligence? {' '}
                                    <Link to="/register" className="text-eco-green font-black hover:underline uppercase tracking-widest ml-1 inline-flex items-center gap-1">
                                        Create Account <ArrowRight size={10} />
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
                
                {/* Visual Feedback Badges (Hidden on mobile) */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 hidden sm:flex justify-center gap-4"
                >
                    {[
                        { icon: ShieldCheck, text: "Encrypted" },
                        { icon: Zap, text: "Real-time" },
                        { icon: Globe, text: "Global" }
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md cursor-default"
                        >
                            <item.icon className="text-eco-green" size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">{item.text}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Background Decoration */}
            <div className="absolute bottom-0 right-0 p-12 opacity-10 pointer-events-none">
                <Sparkles size={160} className="text-eco-green" />
            </div>
        </div>
    );
};

export default Login;

