import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, CheckCircle, Calculator, TrendingDown, BarChart2, Activity, ShieldCheck, Target, Globe, ArrowRight, ArrowDown, Zap, Car, Utensils, Trash2, Info, Sparkles, Terminal, Cpu, Database, RefreshCw } from 'lucide-react';

const steps = [
    { name: 'Transport Emissions',  key: 'transport', detail: 'Distance * Vehicle Factor' },
    { name: 'Energy Consumption',   key: 'energy', detail: 'kWh * Grid Mix Intensity' },
    { name: 'Dietary Impact',       key: 'diet', detail: 'Meal Choice Intensity' },
    { name: 'Heating / Gas',        key: 'heating', detail: 'm³ * Burn Efficiency' },
    { name: 'Waste Disposal',       key: 'waste', detail: 'Weight * Methane Potential' },
];

const CalculationProcess = () => {
    const [step, setStep] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const hasRun = React.useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return; // Only run once, and only when token is ready
        hasRun.current = true;
        const run = async () => {
            const data = JSON.parse(localStorage.getItem('pendingEmission'));
            if (!data) return navigate('/add-data');

            for (let i = 0; i < steps.length; i++) {
                setStep(i);
                await new Promise(r => setTimeout(r, 1100));
            }
            // Final processing state
            setStep(steps.length);
            await new Promise(r => setTimeout(r, 500));

            try {
                const res = await axios.post('http://localhost:5000/api/emissions/add', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
                localStorage.removeItem('pendingEmission');
                // Auto-redirect to dashboard after brief result flash
                setTimeout(() => navigate('/dashboard'), 1800);
            } catch (err) {
                console.error(err);
                const status = err.response?.status;
                // Invalid / expired token → clear session and go to login
                if (status === 401 || status === 422) {
                    logout();
                    navigate('/login');
                    return;
                }
                setError(err.response?.data?.msg || 'Synchronization failed. Please check your connection.');
            }
        };
        run();
    }, [token]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-10 pb-12 max-w-3xl mx-auto py-12 px-6"
        >
            <AnimatePresence mode="wait">
                {step < steps.length ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="neo-card p-6 md:p-16 text-center flex flex-col items-center gap-12 shadow-2xl relative overflow-hidden border-t-4 border-eco-green"
                    >
                        {/* Formula Header */}
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12">
                            <Calculator size={300} />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-[9px] font-black uppercase tracking-[0.3em] animate-pulse border border-eco-green/20">
                                    AI Engine Processing
                                </div>
                                <h2 className="text-4xl font-inter font-black tracking-tighter uppercase text-text-light dark:text-text-dark">Analyzing Impact...</h2>
                            </div>
                            
                            {/* Formula Display */}
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-eco-border inline-flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Formula:</span>
                                <code className="font-mono text-xs font-bold text-analytics-blue">Total CO₂ = Σ(Activity × Factor)</code>
                            </div>
                        </div>

                        {/* Spinner & Progress */}
                        <div className="w-full max-w-md space-y-8 relative z-10">
                            <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-eco-green to-analytics-blue"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / steps.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {steps.map((s, idx) => {
                                    const isActive = idx === step;
                                    const isDone = idx < step;
                                    return (
                                        <motion.div
                                            key={s.key}
                                            className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-white dark:bg-gray-900 border-eco-green shadow-lg scale-[1.02]' : isDone ? 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent opacity-60' : 'bg-transparent border-dashed border-eco-border opacity-30'}`}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? 'bg-eco-green text-white' : isActive ? 'bg-eco-green/20 text-eco-green animate-spin' : 'bg-gray-200 text-gray-400'}`}>
                                                    {isDone ? <CheckCircle size={16} /> : isActive ? <RefreshCw size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-text-light dark:text-text-dark' : 'text-text-muted'}`}>{s.name}</p>
                                                    <p className="text-[9px] font-medium opacity-40 italic">{s.detail}</p>
                                                </div>
                                            </div>
                                            {isDone && <span className="text-[9px] font-black text-eco-green uppercase tracking-widest">Verified</span>}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ) : result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="neo-card p-12 text-center flex flex-col items-center gap-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        {/* Success Icon */}
                        <div className="w-32 h-32 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-xl group transition-transform duration-700 hover:rotate-6">
                            <Leaf size={48} className="text-emerald-500 transition-transform group-hover:scale-110" />
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex flex-col items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-[9px] font-black uppercase tracking-[0.3em] border border-eco-green/20">
                                    Sync Complete
                                </div>
                                <h2 className="text-4xl font-inter font-black tracking-tighter uppercase text-text-light dark:text-text-dark">Analysis Ready</h2>
                            </div>
                            <p className="font-inter font-medium text-text-muted text-sm px-12 leading-relaxed opacity-60">
                                Your environmental footprint has been synchronized with the global database.
                            </p>
                        </div>

                        {/* Result Display */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-4">
                                <span className="font-inter font-black text-[120px] text-primary-light leading-[0.8] tracking-tighter p-2 drop-shadow-md">
                                    {result.total_co2.toFixed(1)}
                                </span>
                                <span className="text-text-muted font-inter font-black uppercase tracking-[0.3em] text-lg">KG CO₂E</span>
                            </div>
                        </div>

                        {/* Metric Tiles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative z-10">
                            <div className="neo-card p-6 text-left flex flex-col gap-4 group hover:bg-eco-green/5 transition-all shadow-sm border-l-4 border-eco-green">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Offset Requirement</span>
                                    <Leaf size={16} className="text-eco-green" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-inter font-black text-4xl text-text-light dark:text-text-dark tracking-tighter leading-none">
                                            {result.trees_to_offset}
                                        </span>
                                        <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Trees</span>
                                    </div>
                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Planting required to neutralize</p>
                                </div>
                            </div>
                            
                            <div className="neo-card p-6 text-left flex flex-col gap-4 group hover:bg-analytics-blue/5 transition-all shadow-sm border-l-4 border-analytics-blue">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Data Integrity</span>
                                    <ShieldCheck size={16} className="text-analytics-blue" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-inter font-black text-4xl text-analytics-blue tracking-tighter leading-none">
                                            SECURE
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Verified by EcoTrack AI Engine</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full relative z-10">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn-neo w-full justify-center py-4 bg-eco-green text-white shadow-2xl shadow-eco-green/20"
                            >
                                <Globe size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Environmental Dashboard</span>
                            </button>
                            <button
                                onClick={() => navigate('/reports')}
                                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-eco-green transition-colors"
                            >
                                View Detailed Report
                            </button>
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="neo-card p-12 text-center flex flex-col items-center gap-8 border-red-500/30 shadow-xl"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-500 shadow-lg">
                            <Activity size={32} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-inter font-black text-2xl text-red-500 tracking-tighter uppercase">Something went wrong</h2>
                            <p className="font-inter font-medium text-text-muted text-sm px-12 leading-relaxed italic">{error}</p>
                        </div>
                        <div className="flex gap-4 w-full max-w-sm">
                            <button onClick={() => window.location.reload()} className="btn-neo-outline flex-1 justify-center py-3 text-[10px] font-black uppercase tracking-widest">
                                Try Again
                            </button>
                            <button onClick={() => navigate('/add-data')} className="btn-neo flex-1 justify-center py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-light/10">
                                Manual Entry
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="neo-card p-16 text-center flex flex-col items-center gap-6 shadow-xl border-primary-light/10">
                        <Activity size={32} className="text-primary-light animate-spin opacity-50" />
                        <div className="space-y-1">
                            <p className="font-inter font-black text-xs text-primary-light uppercase tracking-[0.4em] animate-pulse">Connecting...</p>
                            <p className="text-[10px] font-bold opacity-30 italic">Connecting to our servers...</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CalculationProcess;
