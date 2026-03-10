import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, Utensils, Trash2, Home, ArrowRight, ChevronLeft, Minus, Plus } from 'lucide-react';

const categories = [
    { id: 'transport', name: 'Transport Matrix', icon: Car,      color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.4)'  },
    { id: 'energy',    name: 'Grid Electricity', icon: Zap,      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.4)'  },
    { id: 'diet',      name: 'Diet Protocol',    icon: Utensils, color: '#00FF88', bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.4)'   },
    { id: 'heating',   name: 'Heating System',   icon: Home,     color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.4)'  },
    { id: 'waste',     name: 'Waste Disposal',   icon: Trash2,   color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.4)'  },
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

// Bump a numeric value by step
const bump = (val, step) => {
    const n = parseFloat(val) || 0;
    return Math.max(0, +(n + step).toFixed(2)).toString();
};

const SelectBtn = ({ label, active, color, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: '0.7rem 0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem',
            transition: 'all 0.2s',
            background: active ? `${color}18` : 'var(--bg-card)',
            border: `1px solid ${active ? color : 'var(--border)'}`,
            color: active ? color : 'var(--text-muted)',
        }}
    >
        {label}
    </button>
);

const AddEmissionPage = () => {
    const [mode, setMode]       = useState('Exact Data');   // 'Exact Data' | 'Quick Estimate'
    const [period, setPeriod]   = useState('Daily Entry');  // 'Daily Entry' | 'Monthly Entry'
    const [activeIdx, setActiveIdx] = useState(0);
    const [formData, setFormData]   = useState({ ...EXACT_DEFAULTS });
    const navigate = useNavigate();

    // Switch between modes – pre-fill when Quick Estimate
    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        if (newMode === 'Quick Estimate') {
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
    const isQuick = mode === 'Quick Estimate';

    // Reusable number row for Quick Estimate (stepper) or Exact Data (text input)
    const NumField = ({ field, unit, step = 1 }) => (
        <div>
            {isQuick ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, [field]: bump(f[field], -step) }))}
                        style={{
                            width: 44, height: 44, borderRadius: '0.75rem', cursor: 'pointer',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', fontSize: '1.2rem'
                        }}
                    >−</button>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <span style={{
                            fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '2.5rem',
                            color: cat.color
                        }}>{formData[field]}</span>
                        <span className="neo-label" style={{ marginLeft: '0.5rem' }}>{unit}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, [field]: bump(f[field], step) }))}
                        style={{
                            width: 44, height: 44, borderRadius: '0.75rem', cursor: 'pointer',
                            background: cat.bg, border: `1px solid ${cat.border}`,
                            color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', fontSize: '1.2rem', fontWeight: 700
                        }}
                    >+</button>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={formData[field]}
                        onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                        style={{ paddingRight: '4.5rem', textAlign: 'right', fontFamily: 'Orbitron, monospace', fontSize: '1.5rem', color: 'var(--text)' }}
                    />
                    <span className="neo-label" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>{unit}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl pb-12 space-y-8">

            {/* Page heading */}
            <div>
                <h2 className="font-orbitron font-bold text-3xl uppercase tracking-widest" style={{ color: 'var(--text)' }}>
                    Metric Sync Node
                </h2>
                <p className="neo-label mt-1">Manual Synchronization of Environmental Impact Parameters</p>
            </div>

            {/* Mode + Period selectors */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Period */}
                {['Daily Entry', 'Monthly Entry'].map(p => (
                    <button key={p} type="button"
                        onClick={() => setPeriod(p)}
                        className={period === p ? 'btn-neo' : 'btn-neo-outline'}
                        style={{ fontSize: '0.75rem', padding: '0.38rem 1rem' }}
                    >{p}</button>
                ))}

                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

                {/* Mode */}
                {['Exact Data', 'Quick Estimate'].map(m => (
                    <button key={m} type="button"
                        onClick={() => handleModeSwitch(m)}
                        style={{
                            padding: '0.38rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                            fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem',
                            transition: 'all 0.2s',
                            background: mode === m ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                            border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
                            color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                    >{m}</button>
                ))}

                {isQuick && (
                    <span className="neo-label" style={{ marginLeft: 8, color: 'var(--accent)' }}>
                        ◆ Pre-filled with daily averages — adjust as needed
                    </span>
                )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 9999,
                    background: 'var(--accent)',
                    width: `${((activeIdx + 1) / categories.length) * 100}%`,
                    boxShadow: '0 0 8px rgba(0,255,136,0.5)',
                    transition: 'width 0.4s ease'
                }} />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {categories.map((c, idx) => {
                    const TabIcon = c.icon;
                    const active = idx === activeIdx;
                    return (
                        <button key={c.id} type="button" onClick={() => setActiveIdx(idx)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                                textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                background: active ? c.bg : 'var(--bg-card)',
                                border: `1px solid ${active ? c.border : 'var(--border)'}`,
                                color: active ? c.color : 'var(--text-muted)',
                            }}
                        >
                            <TabIcon size={14} /> {c.name}
                        </button>
                    );
                })}
            </div>

            {/* ── Active Input Panel ── */}
            <div className="neo-card p-8" style={{ border: `2px solid ${cat.border}`, boxShadow: `0 0 25px ${cat.bg}` }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '0.875rem',
                        background: cat.bg, border: `1px solid ${cat.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CatIcon size={24} style={{ color: cat.color }} />
                    </div>
                    <div>
                        <p className="neo-label">Step {activeIdx + 1} of {categories.length} · {mode}</p>
                        <h3 className="font-orbitron font-bold text-xl uppercase tracking-widest mt-1" style={{ color: 'var(--text)' }}>
                            {cat.name}
                        </h3>
                    </div>
                </div>

                {/* ── Transport ── */}
                {cat.id === 'transport' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Distance Traveled</label>
                            <NumField field="transport_km" unit="KM" step={5} />
                        </div>
                        <div>
                            <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Propulsion System</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {TRANSPORT_TYPES.map(t => (
                                    <SelectBtn key={t} label={t} active={formData.transport_type === t.toLowerCase()} color={cat.color}
                                        onClick={() => setFormData(f => ({ ...f, transport_type: t.toLowerCase() }))} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Energy ── */}
                {cat.id === 'energy' && (
                    <div>
                        <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Grid Electricity Consumed</label>
                        <NumField field="electricity_kwh" unit="KWH" step={1} />
                        <p className="neo-label" style={{ marginTop: '0.75rem' }}>Check your electricity bill or estimate daily appliance usage</p>
                    </div>
                )}

                {/* ── Diet ── */}
                {cat.id === 'diet' && (
                    <div>
                        <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Dietary Protocol</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {DIET_TYPES.map(t => (
                                <SelectBtn key={t} label={t} active={formData.diet_type === t} color={cat.color}
                                    onClick={() => setFormData(f => ({ ...f, diet_type: t }))} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Heating ── */}
                {cat.id === 'heating' && (
                    <div>
                        <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Gas / Heating Usage</label>
                        <NumField field="gas_usage" unit="M³" step={0.5} />
                    </div>
                )}

                {/* ── Waste ── */}
                {cat.id === 'waste' && (
                    <div>
                        <label className="neo-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Daily Refuse Generation</label>
                        <NumField field="waste_kg" unit="KG" step={0.5} />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setActiveIdx(i => i - 1)}
                    disabled={activeIdx === 0} className="btn-neo-ghost"
                    style={{ opacity: activeIdx === 0 ? 0.3 : 1, cursor: activeIdx === 0 ? 'not-allowed' : 'pointer' }}>
                    <ChevronLeft size={16} /> Back
                </button>
                <span className="neo-label">{activeIdx + 1} / {categories.length}</span>
                <button type="button" onClick={handleNext} className="btn-neo">
                    {activeIdx === categories.length - 1 ? 'Analyze Now' : 'Continue'}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default AddEmissionPage;
