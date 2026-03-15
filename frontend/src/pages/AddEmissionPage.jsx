import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Car, Zap, Utensils, Trash2, Home, ArrowRight, 
    ChevronLeft, Minus, Plus, Activity, Info, Target, Landmark, Leaf, PlusCircle, MinusCircle, AlertCircle, Sparkles, HelpCircle, Check
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    { id: 'transport', name: 'Transport',      icon: Car,      color: '#16A34A', bg: 'rgba(22,163,74,0.1)',  border: 'rgba(22,163,74,0.2)', description: 'Emissions from vehicles like cars, buses, and bikes.' },
    { id: 'energy',    name: 'Electricity',    icon: Zap,      color: '#2563EB', bg: 'rgba(37,99,235,0.1)',  border: 'rgba(37,99,235,0.2)', description: 'Energy consumed at home or work from electrical sources.' },
    { id: 'diet',      name: 'Food & Diet',    icon: Utensils, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', description: 'The carbon impact of your daily meals and dietary choices.' },
    { id: 'heating',   name: 'Heating',        icon: Home,     color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', description: 'Natural gas or heating systems used in your household.' },
    { id: 'waste',     name: 'Trash & Waste',   icon: Trash2,   color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.2)', description: 'Environmental impact of your non-recyclable waste disposal.' },
];

const TRANSPORT_TYPES = ['Petrol', 'Diesel', 'Electric', 'Bus', 'Bike', 'Walk'];
const DIET_TYPES = ['Vegan', 'Vegetarian', 'Non-Vegetarian'];

// Quick estimate defaults – pre-filled average values
const QUICK_DEFAULTS = {
    transport_km: '15',
    transport_type: 'petrol',
    electricity_kwh: '8',
    diet_type: 'Non-Vegetarian',
    gas_usage: '2',
    waste_kg: '1',
};
const EXACT_DEFAULTS = {
    transport_km: '',
    transport_type: 'petrol',
    electricity_kwh: '',
    diet_type: 'Non-Vegetarian',
    gas_usage: '',
    waste_kg: '',
};

const bump = (val, step) => {
    const n = parseFloat(val) || 0;
    return Math.max(0, +(n + step).toFixed(2)).toString();
};

const SelectBtn = ({ label, active, color, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 rounded-xl font-inter font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border ${active ? 'ring-2 ring-offset-2 scale-[1.02]' : 'bg-gray-50/50 dark:bg-gray-900/50 border-eco-border opacity-70 hover:opacity-100 hover:border-eco-green/30'}`}
        style={{ 
            color: active ? '#FFF' : undefined, 
            borderColor: active ? color : undefined, 
            background: active ? color : undefined,
            ringColor: active ? `${color}40` : undefined
        }}
    >
        {label}
    </button>
);

const TooltipLabel = ({ label, description, color }) => (
    <div className="flex items-center gap-2 mb-2 group cursor-help">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block">{label}</label>
        <div className="relative">
            <Info size={12} className="text-text-muted opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[9px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl border border-white/10">
                {description}
            </div>
        </div>
    </div>
);

const AddEmissionPage = () => {
    const [mode, setMode]       = useState('Enter Manually');   // 'Enter Manually' | 'Use Averages'
    const [period, setPeriod]   = useState('Daily Entry');  // 'Daily Entry' | 'Monthly Entry'
    const [activeIdx, setActiveIdx] = useState(0);
    const [formData, setFormData]   = useState({ ...EXACT_DEFAULTS });
    const navigate = useNavigate();

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        if (newMode === 'Use Averages') {
            setFormData({ ...QUICK_DEFAULTS });
        } else {
            setFormData({ ...EXACT_DEFAULTS });
        }
        setActiveIdx(0);
    };

    const handleNext = () => {
        if (activeIdx < categories.length - 1) {
            setActiveIdx(activeIdx + 1);
        } else {
            localStorage.setItem('pendingEmission', JSON.stringify({ ...formData, period }));
            navigate('/calculation-process');
        }
    };

    const cat = categories[activeIdx];
    const CatIcon = cat.icon;
    const isQuick = mode === 'Use Averages';

    const NumField = ({ field, unit, step = 1 }) => (
        <div className="w-full">
            {isQuick ? (
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, [field]: bump(f[field], -step) }))}
                        className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 border border-eco-border flex items-center justify-center text-text-muted hover:text-primary-light hover:border-primary-light transition-all shadow-sm text-2xl"
                    >−</button>
                    <div className="flex-1 text-center bg-gray-50/50 dark:bg-gray-800/20 py-8 rounded-3xl border border-eco-border shadow-inner group transition-all hover:bg-white dark:hover:bg-gray-800/40">
                        <span className="font-inter font-black text-6xl tracking-tighter transition-colors group-hover:text-primary-light" style={{ color: cat.color }}>
                            {formData[field]}
                        </span>
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40 ml-4">{unit}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, [field]: bump(f[field], step) }))}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-primary-light/20 text-2xl font-black"
                        style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                    >+</button>
                </div>
            ) : (
                <div className="relative group">
                    <input
                        type="number"
                        placeholder="0.00"
                        value={formData[field]}
                        onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full px-8 py-6 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border focus:border-primary-light dark:focus:border-primary-dark focus:ring-1 focus:ring-primary-light/20 outline-none font-inter font-black text-4xl text-right transition-all group-hover:bg-white dark:group-hover:bg-gray-900"
                    />
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{unit} UNIT</span>
                </div>
            )}
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl pb-12 flex flex-col gap-10"
        >
            {/* Page header */}
            <div className="space-y-1">
                <h2 className="neo-heading text-2xl font-bold tracking-tight text-text-light dark:text-text-dark uppercase">Add Emission Data</h2>
                <p className="neo-label font-medium opacity-60 italic">Enter your daily activities to calculate your carbon footprint</p>
            </div>

            {/* Selectors */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-2xl border border-eco-border">
                <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-eco-border">
                    {['Daily Entry', 'Monthly Entry'].map(p => (
                        <button key={p} type="button"
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-lg font-inter font-black text-[10px] uppercase tracking-wider transition-all ${period === p ? 'bg-primary-light text-white shadow-md shadow-primary-light/20' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >{p}</button>
                    ))}
                </div>

                <div className="h-6 w-[1px] bg-border hidden md:block" />

                <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-eco-border">
                    {['Enter Manually', 'Use Averages'].map(m => (
                        <button key={m} type="button"
                            onClick={() => handleModeSwitch(m)}
                            className={`px-4 py-1.5 rounded-lg font-inter font-black text-[10px] uppercase tracking-wider transition-all ${mode === m ? 'bg-secondary-light dark:bg-secondary-dark text-white shadow-md shadow-secondary-light/20' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >{m}</button>
                    ))}
                </div>

                {isQuick && (
                    <div className="flex items-center gap-2 ml-auto px-4 py-1 rounded-full bg-primary-light/5 border border-primary-light/10 animate-pulse">
                        <div className="w-1 h-1 rounded-full bg-primary-light" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Standard Averages Used</span>
                    </div>
                )}
            </div>

            {/* Master Progress */}
            <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">In Progress</span>
                        <h3 className="text-sm font-bold tracking-tight">Step {activeIdx + 1} of {categories.length}: {cat.name}</h3>
                    </div>
                    <span className="font-inter font-black text-xl text-primary-light">{Math.round(((activeIdx + 1) / categories.length) * 100)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-eco-border/20">
                    <div 
                        className="h-full bg-gradient-to-r from-primary-light to-secondary-light transition-all duration-700 ease-out shadow-[0_0_12px_rgba(22,163,74,0.3)]"
                        style={{ width: `${((activeIdx + 1) / categories.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Input Surface */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Navigation Sidebar (Vertical Tabs on Desktop, Horizontal Scroll on Mobile) */}
                <div className="lg:col-span-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar">
                    {categories.map((c, idx) => {
                        const TabIcon = c.icon;
                        const active = idx === activeIdx;
                        const completed = idx < activeIdx;
                        return (
                            <button 
                                key={c.id} 
                                type="button" 
                                onClick={() => setActiveIdx(idx)}
                                className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all border text-left group min-w-[140px] lg:min-w-0
                                    ${active ? 'bg-white dark:bg-gray-900 border-primary-light shadow-lg' : 'bg-transparent border-transparent hover:bg-gray-50/50'}
                                    ${completed ? 'opacity-100' : ''}
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                    ${active ? 'bg-primary-light text-white' : completed ? 'bg-primary-light/10 text-primary-light' : 'bg-gray-100 dark:bg-gray-800 text-text-muted'}
                                `}>
                                    {completed ? <Check size={16} /> : <TabIcon size={16} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-bold tracking-tight ${active ? 'text-text-light dark:text-text-dark' : 'text-text-muted'}`}>{c.name}</span>
                                    {active && <span className="text-[9px] text-primary-light font-black uppercase tracking-widest leading-none mt-1">Active</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Main Form Content */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="neo-card p-10 relative overflow-hidden group">
                        {/* Background Ornament */}
                        <CatIcon className="absolute -bottom-10 -right-10 w-64 h-64 text-current opacity-[0.03] rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0" style={{ color: cat.color }} />

                        <div className="relative z-10 flex flex-col gap-10">
                            {/* Panel Header */}
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:rotate-6"
                                    style={{ background: cat.bg, borderColor: cat.border }}>
                                    <CatIcon size={32} style={{ color: cat.color }} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Module Input</span>
                                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: cat.color }}>{mode}</span>
                                    </div>
                                    <h3 className="font-inter font-black text-2xl text-text-light dark:text-text-dark tracking-tighter">
                                        Configure {cat.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Inputs Grouped inside a Sub-card */}
                            <div className="bg-gray-50/30 dark:bg-black/20 p-8 rounded-2xl border border-eco-border/50">
                                {cat.id === 'transport' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <TooltipLabel label="Distance Traveled" description="Enter the total distance in kilometers you traveled today using this vehicle type." />
                                            <NumField field="transport_km" unit="KM" step={5} />
                                        </div>
                                        <div className="space-y-4">
                                            <TooltipLabel label="Vehicle Type" description="Select the vehicle used. Different vehicles have different emission factors per kilometer." />
                                            <div className="grid grid-cols-2 gap-3">
                                                {TRANSPORT_TYPES.map(t => (
                                                    <SelectBtn key={t} label={t} active={formData.transport_type === t.toLowerCase()} color={cat.color}
                                                        onClick={() => setFormData(f => ({ ...f, transport_type: t.toLowerCase() }))} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {cat.id === 'energy' && (
                                    <div className="space-y-8 max-w-xl">
                                        <div className="space-y-4">
                                            <TooltipLabel label="Electricity Usage" description="Enter your daily electricity consumption in Kilowatt-hours (kWh). Check your smart meter or utility bill." />
                                            <NumField field="electricity_kwh" unit="KWH" step={1} />
                                        </div>
                                        <div className="p-5 rounded-2xl bg-analytics-blue/5 border border-analytics-blue/10 flex gap-4 items-center">
                                            <Activity className="text-analytics-blue" size={18} />
                                            <p className="text-[10px] font-medium opacity-70 leading-relaxed italic">
                                                Global Average for a single person is approximately <span className="font-bold text-analytics-blue">8-10 kWh</span> per day in urban areas.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {cat.id === 'diet' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <TooltipLabel label="Your Diet Pattern" description="Choose the option that matches your meals today. Plant-based diets significantly reduce carbon impact." />
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {DIET_TYPES.map(t => (
                                                    <SelectBtn key={t} label={t} active={formData.diet_type === t} color={cat.color}
                                                        onClick={() => setFormData(f => ({ ...f, diet_type: t }))} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-eco-green/5 border border-eco-green/10 flex gap-4 items-center">
                                            <Leaf className="text-eco-green" size={18} />
                                            <p className="text-[10px] font-medium opacity-70 leading-relaxed italic">
                                                Choosing <span className="font-bold text-eco-green uppercase">Vegan</span> for just one day can save up to 4kg of CO₂ equivalents.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {cat.id === 'heating' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="space-y-4">
                                            <TooltipLabel label="Natural Gas / Heating" description="Amount of heating or gas used in cubic meters (m³). Leave as 0 if not applicable." />
                                            <NumField field="gas_usage" unit="M³" step={0.5} />
                                        </div>
                                    </div>
                                )}

                                {cat.id === 'waste' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="space-y-4">
                                            <TooltipLabel label="Non-Recyclable Waste" description="Weight of trash produced that goes to landfill. Every kilogram contributes to methane emissions." />
                                            <NumField field="waste_kg" unit="KG" step={0.5} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer wizard navigation */}
                    <div className="flex items-center justify-between">
                        <button 
                            type="button" 
                            onClick={() => setActiveIdx(i => i - 1)}
                            disabled={activeIdx === 0} 
                            className={`flex items-center gap-2 font-inter font-black text-[10px] uppercase tracking-[0.2em] transition-all
                                ${activeIdx === 0 ? 'opacity-0 pointer-events-none' : 'text-text-muted hover:text-text-light dark:hover:text-text-dark'}
                            `}
                        >
                            <ChevronLeft size={16} /> Previous Node
                        </button>

                        <button 
                            type="button" 
                            onClick={handleNext} 
                            className="btn-neo px-10 group shadow-xl shadow-primary-light/20 min-w-[200px]"
                        >
                            <span className="text-[10px] uppercase tracking-widest font-black">
                                {activeIdx === categories.length - 1 ? 'Execute Calculation' : 'Advance Station'}
                            </span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between mt-4">
                <button 
                    type="button" 
                    onClick={() => setActiveIdx(i => i - 1)}
                    disabled={activeIdx === 0} 
                    className={`flex items-center gap-2 font-inter font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeIdx === 0 ? 'opacity-20 grayscale pointer-events-none' : 'text-text-muted hover:text-text-light dark:hover:text-text-dark'}`}
                >
                    <ChevronLeft size={16} /> Go Back
                </button>
                
                <div className="flex gap-1.5 items-center">
                    {categories.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'w-8 bg-primary-light' : 'w-1.5 bg-gray-200 dark:bg-gray-800'}`} />
                    ))}
                </div>

                <button 
                    type="button" 
                    onClick={handleNext} 
                    className="btn-neo px-10 group shadow-xl shadow-primary-light/20"
                >
                    <span>{activeIdx === categories.length - 1 ? 'Calculate Now' : 'Next Step'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

export default AddEmissionPage;
