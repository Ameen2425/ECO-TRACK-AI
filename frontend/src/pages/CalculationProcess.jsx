import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Leaf, CheckCircle, RefreshCw, Car, Zap, Home, Trash2,
    Utensils, Globe, Activity, ArrowRight, Info, Trees
} from 'lucide-react';

const steps = [
    { name: 'Transport',        key: 'transport',   icon: Car,      color: '#16A34A' },
    { name: 'Electricity',      key: 'electricity', icon: Zap,      color: '#2563EB' },
    { name: 'Gas & Cooking',    key: 'gas',         icon: Home,     color: '#059669' },
    { name: 'Waste',            key: 'waste',       icon: Trash2,   color: '#0284C7' },
    { name: 'Food & Diet',      key: 'diet',        icon: Utensils, color: '#10B981' },
];

const FormulaCard = ({ label, formula, value, color, detail }) => (
    <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/30 border border-eco-border space-y-3">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
            <span className="font-inter font-black text-lg" style={{ color }}>{value} kg CO₂</span>
        </div>
        {detail && <p className="text-[10px] text-text-muted italic leading-relaxed">{detail}</p>}
        <div className="font-mono text-[10px] bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg text-analytics-blue break-all">
            {formula}
        </div>
    </div>
);

const CalculationProcess = () => {
    const [step,   setStep]   = useState(0);
    const [result, setResult] = useState(null);
    const [error,  setError]  = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const hasRun = React.useRef(false);

    useEffect(() => {
        if (!token || hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            const data = JSON.parse(localStorage.getItem('pendingEmission'));
            if (!data) return navigate('/add-data');

            for (let i = 0; i < steps.length; i++) {
                setStep(i);
                await new Promise(r => setTimeout(r, 900));
            }
            setStep(steps.length);
            await new Promise(r => setTimeout(r, 400));

            try {
                const res = await axios.post('http://localhost:5000/api/emissions/add', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
                setBreakdown(res.data.breakdown || null);
                localStorage.removeItem('pendingEmission');
            } catch (err) {
                const status = err.response?.status;
                if (status === 401 || status === 422) { logout(); navigate('/login'); return; }
                setError(err.response?.data?.msg || 'Synchronization failed. Please check your connection.');
            }
        };
        run();
    }, [token]);

    const treesNeeded = result?.trees_to_offset ?? Math.ceil((result?.total_co2 ?? 0) / 21);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto pb-12 flex flex-col gap-8 py-8 px-4"
        >
            <AnimatePresence mode="wait">
                {/* ── Processing ── */}
                {step < steps.length && (
                    <motion.div key="processing"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="neo-card p-8 md:p-14 text-center flex flex-col items-center gap-10 border-t-4 border-eco-green shadow-2xl"
                    >
                        <div className="space-y-3">
                            <div className="inline-flex px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-[9px] font-black uppercase tracking-[0.3em] border border-eco-green/20 animate-pulse">
                                AI Engine Processing
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase text-text-light dark:text-text-dark">Calculating Impact...</h2>
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Formula:</span>
                                <code className="font-mono text-xs font-bold text-analytics-blue">Total CO₂ = Σ(Activity × Factor × Multiplier)</code>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full max-w-md space-y-6">
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-eco-green to-analytics-blue rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / steps.length) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>

                            <div className="space-y-2">
                                {steps.map((s, idx) => {
                                    const StepIcon = s.icon;
                                    const isActive = idx === step;
                                    const isDone   = idx < step;
                                    return (
                                        <div key={s.key} className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                                            isActive ? 'bg-white dark:bg-gray-900 border-eco-green shadow-lg'
                                            : isDone ? 'bg-gray-50/50 dark:bg-gray-800/20 border-transparent opacity-70'
                                            : 'border-dashed border-eco-border opacity-30'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    isDone ? 'bg-eco-green text-white' : isActive ? 'bg-eco-green/10 text-eco-green' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                }`}>
                                                    {isDone ? <CheckCircle size={14} /> : isActive ? <RefreshCw size={14} className="animate-spin" /> : <StepIcon size={14} />}
                                                </div>
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-text-light dark:text-text-dark' : 'text-text-muted'}`}>{s.name}</p>
                                                </div>
                                            </div>
                                            {isDone && <span className="text-[9px] font-black text-eco-green uppercase tracking-widest">Done ✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Result ── */}
                {step >= steps.length && result && (
                    <motion.div key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8"
                    >
                        {/* Hero result card */}
                        <div className="neo-card p-8 md:p-12 text-center flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden border-t-4 border-eco-green">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-xl">
                                <Leaf size={36} className="text-emerald-500" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="inline-flex px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-[9px] font-black uppercase tracking-[0.3em] border border-eco-green/20">
                                    Analysis Complete
                                </div>
                                <h2 className="text-3xl font-black tracking-tight uppercase text-text-light dark:text-text-dark">Results Ready</h2>
                            </div>
                            <div className="flex items-baseline gap-3 relative z-10">
                                <span className="font-inter font-black text-7xl md:text-8xl text-eco-green leading-none tracking-tighter">
                                    {result.total_co2.toFixed(1)}
                                </span>
                                <span className="font-black text-text-muted uppercase tracking-widest text-sm">kg CO₂e</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                                <div className="neo-card p-5 text-left border-l-4 border-eco-green">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Trees to Offset</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-black text-3xl text-eco-green">{treesNeeded}</span>
                                        <span className="text-xs opacity-40 font-bold">trees / 21 kg</span>
                                    </div>
                                    <p className="text-[9px] opacity-30 mt-1 uppercase tracking-widest">Annual absorption = 21 kg/tree</p>
                                </div>
                                <div className="neo-card p-5 text-left border-l-4 border-analytics-blue">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Sustainability Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-black text-3xl text-analytics-blue">{result.score}</span>
                                        <span className="text-xs opacity-40 font-bold">/ 100 pts</span>
                                    </div>
                                    <p className="text-[9px] opacity-30 mt-1 uppercase tracking-widest">EcoTrack AI Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Category breakdown */}
                        {breakdown && (
                            <div className="neo-card p-6 md:p-8 space-y-6">
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest text-text-light dark:text-text-dark">Step-by-Step Breakdown</h3>
                                    <p className="text-[10px] text-text-muted mt-1">Per-category emission calculation details</p>
                                </div>
                                <div className="space-y-4">
                                    {breakdown.transport && (
                                        <FormulaCard
                                            label="🚗 Transport"
                                            color="#16A34A"
                                            value={breakdown.transport.co2}
                                            formula={breakdown.transport.formula}
                                            detail={breakdown.transport.vehicle_brand 
                                                ? `${breakdown.transport.vehicle_brand} ${breakdown.transport.vehicle_model} (${breakdown.transport.vehicle_year}) · ${breakdown.transport.fuel_detail.toUpperCase()} · ${breakdown.transport.km} km · ${breakdown.transport.driving_condition.toUpperCase()} (${breakdown.transport.condition_multiplier}x) · Efficiency (${breakdown.transport.efficiency_multiplier}x)` 
                                                : breakdown.transport.vehicle_model
                                                    ? `${breakdown.transport.vehicle_model} · ${breakdown.transport.fuel_detail} · ${breakdown.transport.vehicle_age_years}y old · ×${breakdown.transport.age_multiplier} multiplier`
                                                    : `${breakdown.transport.fuel_detail} · ×${breakdown.transport.age_multiplier} age multiplier`}
                                        />
                                    )}
                                    {breakdown.electricity && (
                                        <FormulaCard label="⚡ Electricity" color="#2563EB" value={breakdown.electricity.co2} formula={breakdown.electricity.formula} />
                                    )}
                                    {breakdown.gas && (
                                        <FormulaCard label="🔥 Gas & Cooking" color="#059669" value={breakdown.gas.co2} formula={breakdown.gas.formula} />
                                    )}
                                    {breakdown.waste && (
                                        <FormulaCard
                                            label="🗑️ Waste"
                                            color="#0284C7"
                                            value={breakdown.waste.co2}
                                            formula={breakdown.waste.formula}
                                            detail={breakdown.waste.recycling_reduction > 0 ? `Recycling/composting reduced emissions by ${(breakdown.waste.recycling_reduction * 100).toFixed(0)}%` : ''}
                                        />
                                    )}
                                    {breakdown.diet && (
                                        <FormulaCard label="🥗 Food & Diet" color="#10B981" value={breakdown.diet.co2} formula={breakdown.diet.formula} />
                                    )}
                                </div>

                                <div className="p-4 rounded-2xl bg-eco-green/5 border border-eco-green/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-eco-green">Total CO₂ Formula</span>
                                        <span className="font-black text-eco-green">{result.total_co2.toFixed(2)} kg</span>
                                    </div>
                                    <code className="block font-mono text-[10px] text-text-muted mt-2">
                                        Total = Transport + Electricity + Gas + Waste + Diet
                                    </code>
                                </div>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/dashboard')} className="btn-neo w-full justify-center py-4 bg-eco-green text-white shadow-xl shadow-eco-green/20">
                                <Globe size={18} /><span className="font-black uppercase tracking-widest text-[10px]">Open Dashboard</span>
                            </button>
                            <button onClick={() => navigate('/reports')} className="btn-neo-outline w-full justify-center py-3 text-[10px] font-black uppercase tracking-widest">
                                View Analytics Report
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Error ── */}
                {step >= steps.length && error && (
                    <motion.div key="error" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        className="neo-card p-12 text-center flex flex-col items-center gap-8 border-red-500/30 shadow-xl"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-500">
                            <Activity size={28} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-black text-xl text-red-500 tracking-tight uppercase">Something went wrong</h2>
                            <p className="text-sm text-text-muted italic">{error}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.reload()} className="btn-neo-outline px-6 py-3 text-[10px] font-black uppercase tracking-widest">Try Again</button>
                            <button onClick={() => navigate('/add-data')} className="btn-neo px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg">Back to Entry</button>
                        </div>
                    </motion.div>
                )}

                {/* ── Initial loading ── */}
                {step >= steps.length && !result && !error && (
                    <div className="neo-card p-16 text-center flex flex-col items-center gap-6">
                        <RefreshCw size={28} className="text-eco-green animate-spin opacity-60" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-eco-green animate-pulse">Connecting to server...</p>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CalculationProcess;
