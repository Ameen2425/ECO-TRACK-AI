import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Car, Zap, Utensils, Calculator, Leaf, TrendingDown, 
    TrendingUp, ArrowRight, Activity, Plus, Minus, Globe, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const TRANSPORT_TYPES = ['Petrol', 'Diesel', 'Electric', 'Bus', 'Bike', 'Walk'];
const DIET_TYPES      = ['Vegan', 'Vegetarian', 'Non-Vegetarian'];

const FACTORS = {
    petrol: 0.18, diesel: 0.17, electric: 0.05, bus: 0.03, bike: 0, walk: 0,
    electricity: 0.5, gas: 2.0,
    vegan: 1.5, vegetarian: 2.5, 'non-vegetarian': 5.0,
    waste: 0.5,
};

const Btn = ({ label, active, color, onClick }) => (
    <button type="button" onClick={onClick} 
        className={`px-4 py-2.5 rounded-xl font-inter font-black text-[9px] uppercase tracking-wider transition-all shadow-sm border ${active ? 'bg-primary-light/10 border-primary-light text-primary-light ring-2 ring-primary-light/5' : 'bg-gray-50/50 dark:bg-gray-900/50 border-eco-border text-text-muted hover:border-primary-light/30'}`}
        style={{ color: active ? color : undefined, borderColor: active ? color : undefined, background: active ? `${color}10` : undefined }}>
        {label}
    </button>
);

const QuickCheck = () => {
    const { token } = useAuth();
    const navigate  = useNavigate();
    const [form, setForm] = useState({
        km: '15', transport: 'petrol',
        kwh: '8', diet: 'Non-Vegetarian',
        gas: '2', waste: '1',
    });
    const [loading, setLoading] = useState(false);
    const [saved,   setSaved]   = useState(false);
    const f = v => parseFloat(v) || 0;

    const co2 = +(
        f(form.km) * (FACTORS[form.transport.toLowerCase()] ?? 0.18) +
        f(form.kwh) * FACTORS.electricity +
        f(form.gas) * FACTORS.gas +
        f(form.waste) * FACTORS.waste +
        (FACTORS[form.diet.toLowerCase()] ?? 5.0)
    ).toFixed(2);

    const score  = Math.max(0, Math.round(100 - co2 * 2));
    const isGood = co2 < 15;

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/emissions/add', {
                transport_km:    form.km,
                transport_type:  form.transport,
                electricity_kwh: form.kwh,
                diet_type:       form.diet,
                gas_usage:       form.gas,
                waste_kg:        form.waste,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSaved(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false); 
        }
    };

    const Row = ({ label, field, unit, step = 1 }) => (
        <div className="flex items-center gap-4 justify-between group">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 min-w-[120px] group-hover:opacity-100 transition-opacity italic">{label}</span>
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => setForm(p => ({ ...p, [field]: Math.max(0, +(f(p[field]) - step)).toString() }))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-eco-border flex items-center justify-center text-text-muted hover:text-eco-green hover:border-eco-green transition-all shadow-sm">
                    <Minus size={16} />
                </button>
                <input type="number" value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className="w-24 text-center py-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-900 border border-eco-border outline-none font-inter font-black text-sm transition-all focus:border-eco-green" />
                <button type="button" onClick={() => setForm(p => ({ ...p, [field]: (+(f(p[field]) + step)).toString() }))}
                    className="w-10 h-10 rounded-xl bg-eco-green/5 border border-eco-green/10 flex items-center justify-center text-eco-green hover:bg-eco-green hover:text-white transition-all shadow-sm hover:shadow-eco-green/20">
                    <Plus size={16} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30 w-10 italic">{unit}</span>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl pb-12 flex flex-col gap-10"
        >
            <div className="space-y-1">
                <h2 className="text-2xl font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">Instant Analysis</h2>
                <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Rapidly estimate your daily carbon footprint and archive the result</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
                <div className="neo-card p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                        <Globe size={300} />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-analytics-blue/10 border border-analytics-blue/20 flex items-center justify-center text-analytics-blue shadow-sm">
                                <Car size={18} />
                            </div>
                            <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-light dark:text-text-dark italic">Transport Dynamics</h4>
                        </div>
                        <Row label="Distance Matrix" field="km" unit="KM" step={5} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {TRANSPORT_TYPES.map(t => (
                                <Btn key={t} label={t} active={form.transport.toLowerCase() === t.toLowerCase()} color="#2563EB"
                                    onClick={() => setForm(p => ({ ...p, transport: t.toLowerCase() }))} />
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-border relative z-10" />

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green shadow-sm">
                                <Zap size={18} />
                            </div>
                            <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-light dark:text-text-dark italic">Energy Infrastructure</h4>
                        </div>
                        <div className="space-y-6">
                            <Row label="Grid Consumption" field="kwh" unit="KWH" step={2} />
                            <Row label="Thermal Load" field="gas" unit="M³" step={0.5} />
                        </div>
                    </div>

                    <div className="h-px bg-border relative z-10" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <Utensils size={18} />
                                </div>
                                <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-light dark:text-text-dark italic">Nutritional Node</h4>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {DIET_TYPES.map(t => (
                                    <Btn key={t} label={t} active={form.diet === t} color="#10B981"
                                        onClick={() => setForm(p => ({ ...p, diet: t }))} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-500 shadow-sm">
                                    <Calculator size={18} />
                                </div>
                                <h4 className="font-inter font-black text-xs uppercase tracking-[0.2em] text-text-light dark:text-text-dark italic">Waste Management</h4>
                            </div>
                            <Row label="Refuse Output" field="waste" unit="KG" step={0.5} />
                        </div>
                    </div>
                </div>

                <div className="space-y-8 sticky top-8">
                    {/* Live Magnitude Card */}
                    <div className="neo-card p-10 text-center relative overflow-hidden group shadow-2xl border-t-4 border-analytics-blue bg-white dark:bg-gray-900">
                        <div className="absolute inset-0 bg-analytics-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Live Magnitude</span>
                        <div className="font-inter font-black text-7xl tracking-tighter text-analytics-blue mt-6 mb-2 transition-transform duration-700 group-hover:scale-110 italic drop-shadow-2xl">
                            {co2.toFixed(1)}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">KG CO₂ / DAILY ESTIMATE</p>

                        <div className="mt-10 flex items-center justify-center gap-3 py-2 px-5 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 border border-eco-border inline-flex shadow-inner">
                            {isGood ? <TrendingDown size={14} className="text-eco-green" /> : <TrendingUp size={14} className="text-analytics-blue" />}
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isGood ? 'text-eco-green' : 'text-analytics-blue'}`}>
                                {isGood ? 'Optimal Range' : 'Above Average'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="neo-card p-6 text-center shadow-lg border-l-4 border-eco-green">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Eco Score</p>
                            <div className="font-inter font-black text-3xl tracking-tighter mt-1 italic" style={{ color: score > 60 ? '#16A34A' : '#2563EB' }}>
                                {score}
                            </div>
                        </div>
                        <div className="neo-card p-6 text-center shadow-lg border-l-4 border-analytics-blue">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Stability</p>
                            <div className={`font-inter font-black text-xs tracking-widest mt-3 flex items-center justify-center gap-2 ${saved ? 'text-eco-green' : 'text-text-muted'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${saved ? 'bg-eco-green animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.5)]' : 'bg-gray-400'}`} />
                                {saved ? 'STABLE' : 'PENDING'}
                            </div>
                        </div>
                    </div>

                    <div className="neo-card p-8 flex items-center gap-6 shadow-xl border-l-4 border-emerald-500">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-900/40 shadow-inner">
                            <Leaf size={28} />
                        </div>
                        <div>
                            <div className="font-inter font-black text-3xl tracking-tighter text-text-light dark:text-text-dark italic leading-none">
                                {Math.ceil(co2 * 7 / 0.42)}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Nature Offset Node</span>
                        </div>
                    </div>

                    {!saved ? (
                        <button onClick={handleSave} disabled={loading} className="btn-neo w-full py-5 justify-center shadow-2xl shadow-eco-green/20 group text-sm relative overflow-hidden bg-eco-green">
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative z-10 flex items-center gap-3">
                                {loading ? <Activity size={18} className="animate-spin" /> : <Target size={18} />}
                                <span className="font-black uppercase tracking-[0.2em]">{loading ? 'Synthesizing...' : 'Commit to Archive'}</span>
                            </div>
                        </button>
                    ) : (
                        <button onClick={() => navigate('/dashboard')} className="btn-neo-outline w-full py-5 justify-center border-eco-green text-eco-green group text-sm">
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            <span className="font-black uppercase tracking-[0.2em] ml-2">Open Terminal</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default QuickCheck;
