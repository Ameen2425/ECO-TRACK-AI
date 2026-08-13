import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Lock, User, Mail, Smartphone, AlertCircle, 
    ShieldCheck, UserPlus, Activity, Leaf, 
    ArrowRight, Sparkles, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import registerHero from '../assets/register-hero.png';

const Register = () => {
    const [form, setForm] = useState({ 
        name: '', 
        contact: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                contact: form.contact,
                name: form.name,
                password: form.password,
                confirm_password: form.confirmPassword
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="w-full flex items-center justify-center p-4">
            {/* Centered Glass Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl mx-auto"
            >
                <div className="bg-white/70 dark:bg-[#0F172A]/80 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden overflow-y-auto no-scrollbar max-h-[90vh]">
                    <div className="p-6 sm:p-10 md:p-14 space-y-8 sm:space-y-10">
                        
                        {/* Branding Header */}
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="flex flex-col items-center text-center space-y-4 sm:space-y-6"
                        >
                            <motion.div 
                                whileHover={{ rotate: -15, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-eco-green flex items-center justify-center shadow-xl shadow-eco-green/40 cursor-pointer"
                            >
                                <Leaf className="text-white" size={32} />
                            </motion.div>
                            <div className="space-y-1">
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">
                                    ECO<span className="text-eco-green">TRACK</span>
                                </h2>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-text-muted opacity-70">Intelligence Systems Initialize</p>
                            </div>
                        </motion.div>

                        {/* Register Form */}
                        <div className="space-y-6 sm:space-y-8">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Initialize Profile</h3>
                                <p className="text-[10px] sm:text-xs text-text-muted font-medium mt-1">Connect your identity to the intelligence matrix.</p>
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

                            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Name */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <User size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" />
                                            <input 
                                                type="text" 
                                                name="name"
                                                placeholder="Johnathan Doe"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Contact */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.65 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Identity Vector</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors">
                                                {form.contact.includes('@') ? <Mail size={18} /> : <Smartphone size={18} />}
                                            </div>
                                            <input 
                                                type="text" 
                                                name="contact"
                                                placeholder="Email or System ID..."
                                                value={form.contact}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                            />
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Password */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Security Key</label>
                                        <div className="relative group">
                                            <Lock size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" />
                                            <input 
                                                type="password" 
                                                name="password"
                                                placeholder="••••••••"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Confirm Password */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.75 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Confirm Key</label>
                                        <div className="relative group">
                                            <ShieldCheck size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-eco-green transition-colors" />
                                            <input 
                                                type="password" 
                                                name="confirmPassword"
                                                placeholder="••••••••"
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/40 dark:bg-white/5 border border-eco-border dark:border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 font-medium text-sm focus:border-eco-green focus:bg-white dark:focus:bg-white/10 transition-all outline-none shadow-sm group-hover:border-eco-green/50"
                                            />
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.button 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-eco-green text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-xl shadow-eco-green/20 transition-all flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 mt-2 sm:mt-4"
                                >
                                    {loading ? <Activity size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                    <span>{loading ? 'Initializing...' : 'Establish Profile'}</span>
                                </motion.button>
                            </form>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="pt-6 border-t border-eco-border dark:border-white/10 text-center"
                            >
                                <p className="text-text-muted text-[10px] sm:text-[11px] font-bold">
                                    Already Authenticated? {' '}
                                    <Link to="/login" className="text-eco-green font-black hover:underline uppercase tracking-widest ml-1 inline-flex items-center gap-1">
                                        Secure Login <ArrowRight size={10} />
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
                        { icon: UserPlus, text: "Instant" },
                        { icon: Zap, text: "Smart" },
                        { icon: Globe, text: "Global" },
                        { icon: ShieldCheck, text: "Secure" }
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
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Sparkles size={160} className="text-eco-green" />
            </div>
        </div>
    );
};

export default Register;
