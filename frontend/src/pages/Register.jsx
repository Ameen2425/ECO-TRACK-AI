import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Mail, Smartphone, AlertCircle, ShieldCheck, UserPlus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] p-6 text-text-light dark:text-text-dark font-inter overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-light/10 border border-primary-light/20 flex items-center justify-center shadow-lg transition-transform hover:rotate-12">
                            <UserPlus className="text-primary-light" size={28} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-text-light dark:text-text-dark uppercase italic">ECO-TRACK AI</h2>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Create Your Account</p>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-[#1E293B] border border-eco-border-light dark:border-eco-border-dark rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-light/20" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary-light/10 transition-colors" />

                    {error && (
                        <div className="mb-8 flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold shadow-sm">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Full Name</label>
                            <div className="relative group/field">
                                <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within/field:text-primary-light" />
                                <input 
                                    type="text" 
                                    name="name"
                                    placeholder="Full Name..."
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border-light dark:border-eco-border-dark rounded-2xl py-4 pl-14 pr-6 font-inter font-medium text-sm focus:border-primary-light focus:bg-white dark:focus:bg-gray-800 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Contact Field */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Email or Username</label>
                            <div className="relative group/field">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within/field:text-primary-light">
                                    {form.contact.includes('@') ? <Mail size={20} /> : <Smartphone size={20} />}
                                </div>
                                <input 
                                    type="text" 
                                    name="contact"
                                    placeholder="Email or Data ID..."
                                    value={form.contact}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border-light dark:border-eco-border-dark rounded-2xl py-4 pl-14 pr-6 font-inter font-medium text-sm focus:border-primary-light focus:bg-white dark:focus:bg-gray-800 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Password Field */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Choose Password</label>
                                <div className="relative group/field">
                                    <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within/field:text-primary-light" />
                                    <input 
                                        type="password" 
                                        name="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border-light dark:border-eco-border-dark rounded-2xl py-4 pl-14 pr-6 font-inter font-medium text-sm focus:border-primary-light focus:bg-white dark:focus:bg-gray-800 transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Confirm Password</label>
                                <div className="relative group/field">
                                    <ShieldCheck size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within/field:text-primary-light" />
                                    <input 
                                        type="password" 
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border-light dark:border-eco-border-dark rounded-2xl py-4 pl-14 pr-6 font-inter font-medium text-sm focus:border-primary-light focus:bg-white dark:focus:bg-gray-800 transition-all outline-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary-light dark:bg-primary-dark text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary-light/25 hover:translate-y-[-2px] active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {loading ? <Activity size={20} className="animate-spin" /> : <UserPlus size={20} />}
                            <span>{loading ? 'Sending Request...' : 'Create Account'}</span>
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-text-muted text-[11px] font-bold">
                    Already have an account? {' '}
                    <Link to="/login" className="text-primary-light font-black hover:underline uppercase tracking-widest ml-1">Login here</Link>
                </p>
            </motion.div>
            
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-analytics-blue/5 rounded-full blur-[120px]" />
            </div>
        </div>
    );
};

export default Register;
