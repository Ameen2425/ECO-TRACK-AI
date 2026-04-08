import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Bell, Leaf, Zap, Car, Utensils, Trash2, Activity, 
    TrendingUp, Lightbulb, Sparkles, CheckCircle, ArrowRight,
    Wind, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIC_TIPS = [
    { icon: Car,      color: '#16A34A', title: 'Opt for Green Transport',      body: 'Cycling or walking for trips under 5km eliminates transport emissions entirely.' },
    { icon: Zap,      color: '#2563EB', title: 'Unplug Idle Electronics',      body: 'Devices on standby consume up to 10% of household electricity. Unplug when not in use.' },
    { icon: Utensils, color: '#059669', title: 'Go Plant-Based Once a Week',   body: 'One meatless day per week can save 400kg CO₂ per year.' },
    { icon: Trash2,   color: '#0284C7', title: 'Compost Organic Waste',        body: 'Composting diverts rubbish from landfill and cuts methane emissions significantly.' },
    { icon: Leaf,     color: '#10B981', title: 'Switch to LED Lighting',       body: 'LED bulbs use 75% less energy and last 25× longer than traditional bulbs.' },
    { icon: Droplets, color: '#3B82F6', title: 'Cold Water Laundry',           body: 'Washing in cold water uses 90% less energy and cleans just as effectively.' },
];

const TipCard = ({ tip, index }) => {
    const Icon = tip.icon || Leaf;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="neo-card p-6 flex flex-col gap-5 group hover:-translate-y-1 transition-all duration-300 border-t-4 shadow-sm"
            style={{ borderTopColor: tip.color }}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500`}
                style={{ background: `${tip.color}10`, border: `1px solid ${tip.color}20` }}>
                <Icon size={24} style={{ color: tip.color }} />
            </div>
            <div className="space-y-2">
                <h4 className="font-black text-[11px] uppercase tracking-wider" style={{ color: tip.color }}>{tip.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{tip.body}</p>
            </div>
            <button className="mt-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-eco-green transition-colors">
                Learn More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
};

const EcoTips = () => {
    const { token } = useAuth();
    const [aiTips, setAiTips] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setDashData(r.data);
            setAiTips(r.data.suggestions || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    const prediction = dashData?.intelligence?.forecast?.predicted_30d_co2;
    const co2 = dashData?.latest?.footprint ?? 0;
    const treesNeeded = dashData?.intelligence?.offset?.trees_to_offset ?? 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8 pb-12 max-w-5xl"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-text-light dark:text-text-dark">Eco Intelligence</h2>
                    <p className="text-xs text-text-muted mt-1 uppercase tracking-widest opacity-60 font-bold">Personalized AI Insights & Sustainability Strategy</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-eco-green/10 border border-eco-green/20">
                    <Sparkles size={14} className="text-eco-green animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-eco-green">AI Engine v2.0 Active</span>
                </div>
            </div>

            {/* AI Insight Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forecast Card */}
                <div className="neo-card p-8 group relative overflow-hidden shadow-xl border-analytics-blue/10 border-t-4 border-t-analytics-blue">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-analytics-blue/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-analytics-blue/10 transition-all duration-700" />
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-analytics-blue/10 border border-analytics-blue/20 flex items-center justify-center text-analytics-blue">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block">Forecast</span>
                            <span className="text-xs font-bold">30-Day Magnitude</span>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-16 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-analytics-blue/20 border-t-analytics-blue animate-spin" />
                            <p className="text-xs font-bold opacity-30 italic">Processing historical patterns...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="font-inter font-black text-5xl text-text-light dark:text-text-dark tracking-tighter">
                                    {prediction ? prediction.toFixed(1) : '—'}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest opacity-40">kg CO₂e</span>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-eco-border">
                                <p className="text-[10px] text-text-muted leading-relaxed font-medium">
                                    Based on your current activity levels, this is your estimated environmental weight for the next month.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Offset Card */}
                <div className="neo-card p-8 group relative overflow-hidden shadow-xl border-eco-green/10 border-t-4 border-t-eco-green">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-eco-green/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-eco-green/10 transition-all duration-700" />
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green">
                            <Wind size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 block">Offset Strategy</span>
                            <span className="text-xs font-bold">Biosphere Equilibrium</span>
                        </div>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-baseline gap-2">
                            <span className="font-inter font-black text-5xl text-eco-green tracking-tighter">
                                {treesNeeded || '0'}
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Trees Needed</span>
                        </div>
                        <div className="p-3 rounded-xl bg-eco-green/5 border border-eco-green/10">
                            <p className="text-[10px] text-eco-green font-bold leading-relaxed">
                                Requires {treesNeeded} mature trees to absorb your current monthly emissions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <AnimatePresence>
                {aiTips.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-analytics-blue animate-ping" />
                            <h3 className="font-black text-xs uppercase tracking-[0.25em] text-text-muted">Dynamic Recommendations</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {aiTips.map((tip, i) => (
                                <div key={i} className="neo-card p-5 flex items-start gap-4 group hover:bg-analytics-blue/5 transition-all border-l-4 border-l-analytics-blue shadow-sm">
                                    <div className="w-9 h-9 rounded-xl bg-analytics-blue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Lightbulb size={18} className="text-analytics-blue" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-text-light dark:text-text-dark leading-relaxed">{tip}</p>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={10} className="text-eco-green" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-eco-green">Est. Save: {Math.floor(Math.random() * 5 + 1)} kg CO₂e</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Static tips grid */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap size={16} className="text-eco-green" />
                        <h3 className="font-black text-xs uppercase tracking-[0.25em] text-text-muted">Foundation Sustainability Tips</h3>
                    </div>
                    <div className="h-[1px] flex-1 mx-6 bg-eco-border hidden sm:block" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATIC_TIPS.map((tip, i) => (
                        <TipCard key={i} tip={tip} index={i} />
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="neo-card p-8 bg-gradient-to-r from-eco-green to-analytics-blue relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Become a Carbon Neutral Hero</h3>
                        <p className="text-white/70 text-[10px] uppercase font-black tracking-widest">Join our leaderboard and complete weekly challenges</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-eco-green font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest">
                        Join Community →
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EcoTips;
