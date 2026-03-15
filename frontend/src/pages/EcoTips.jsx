import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Leaf, Zap, Car, Utensils, Trash2, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const STATIC_TIPS = [
    { icon: Car,      color: '#3B82F6', title: 'Opt for Green Transport',      body: 'Cycling or walking for trips under 5km eliminates transport emissions entirely.' },
    { icon: Zap,      color: '#F59E0B', title: 'Unplug Idle Electronics',      body: 'Devices on standby consume up to 10% of household electricity. Unplug when not in use.' },
    { icon: Utensils, color: '#00FF88', title: 'Go Plant-Based Once a Week',   body: 'One meatless day per week can save 400kg CO₂ per year.' },
    { icon: Trash2,   color: '#A855F7', title: 'Compost Organic Waste',        body: 'Composting diverts rubbish from landfill and cuts methane emissions significantly.' },
    { icon: Leaf,     color: '#10B981', title: 'Switch to LED Lighting',       body: 'LED bulbs use 75% less energy and last 25× longer than traditional incandescent bulbs.' },
    { icon: Zap,      color: '#F97316', title: 'Use Cold Water for Laundry',   body: 'Washing in cold water uses 90% less energy and cleans just as effectively.' },
];

const EcoTips = () => {
    const { token } = useAuth();
    const [aiTips, setAiTips] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setDashData(r.data);
            setAiTips(r.data.suggestions || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    const prediction = dashData?.stats?.prediction;
    const co2 = dashData?.latest?.footprint ?? 0;
    const trend = typeof prediction === 'number' ? `${prediction.toFixed(1)} KG` : prediction;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-10 pb-12"
        >
            <div className="space-y-1">
                <h2 className="text-2xl font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">Eco Intelligence</h2>
                <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Personalized suggestions to help you reduce your environmental weight</p>
            </div>

            {/* Performance Prognosis Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temporal Prognosis */}
                <div className="neo-card p-8 group relative overflow-hidden shadow-lg border-primary-light/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-light/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-light/10 border border-primary-light/20 flex items-center justify-center text-primary-light transition-transform group-hover:rotate-6">
                            <TrendingUp size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">30-Day Forecast</span>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Activity size={20} className="animate-spin text-primary-light opacity-50" />
                            <p className="text-xs font-bold opacity-30 italic">Calculating forecast...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="font-inter font-black text-4xl text-text-light dark:text-text-dark tracking-tighter leading-none">
                                {prediction ? `${trend}` : 'Pending Baseline'}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light">Predicted 30-Day Magnitude</span>
                                <p className="text-[9px] font-bold opacity-30 italic leading-none">Intelligence based on historical patterns</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Biosphere Equilibrium */}
                <div className="neo-card p-8 group relative overflow-hidden shadow-lg border-emerald-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-transform group-hover:rotate-6">
                            <Bell size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Nature Offset</span>
                    </div>
                    <div className="space-y-4">
                        <div className="font-inter font-black text-5xl text-text-light dark:text-text-dark tracking-tighter leading-none">
                            {co2 > 0 ? (co2 * 7 / 0.42).toFixed(1) : '0.0'}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Trees needed for offset</span>
                            <p className="text-[9px] font-bold opacity-30 italic">Recommended trees to plant per week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI suggestions */}
            {aiTips.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-primary-light" />
                        <h3 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-muted">AI Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {aiTips.map((tip, i) => (
                            <div key={i} className="neo-card p-6 flex items-start gap-5 group hover:translate-x-1 transition-all border-l-4 border-l-primary-light shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-primary-light/5 border border-primary-light/10 flex items-center justify-center shrink-0 group-hover:bg-primary-light/10 transition-colors">
                                    <Leaf size={18} className="text-primary-light" />
                                </div>
                                <p className="font-inter font-medium text-sm text-text-light dark:text-text-dark leading-relaxed py-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Static tips grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Zap size={16} className="text-secondary-light" />
                    <h3 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-muted">General Eco Tips</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATIC_TIPS.map((tip, i) => {
                        const TipIcon = tip.icon;
                        return (
                            <div key={i} className="neo-card p-8 flex flex-col gap-4 group hover:translate-y-[-4px] transition-all shadow-sm border-t-4" style={{ borderTopColor: tip.color }}>
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg] shadow-inner" style={{ background: `${tip.color}10`, border: `1px solid ${tip.color}20` }}>
                                    <TipIcon size={24} style={{ color: tip.color }} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-inter font-black text-[11px] uppercase tracking-wider transition-colors group-hover:text-primary-light" style={{ color: tip.color }}>{tip.title}</h4>
                                    <p className="font-inter text-xs text-text-muted leading-relaxed">{tip.body}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default EcoTips;
