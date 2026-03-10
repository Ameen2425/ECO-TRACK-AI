import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Car, Zap, Utensils, Calculator, Leaf, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';

const TRANSPORT_TYPES = ['Petrol', 'Diesel', 'Electric', 'Bus', 'Bike', 'Walk'];
const DIET_TYPES      = ['Vegan', 'Vegetarian', 'Non-Vegetarian'];

const FACTORS = {
    petrol: 0.18, diesel: 0.17, electric: 0.05, bus: 0.03, bike: 0, walk: 0,
    electricity: 0.5, gas: 2.0,
    vegan: 1.5, vegetarian: 2.5, 'non-vegetarian': 5.0,
    waste: 0.5,
};

const Btn = ({ label, active, color, onClick }) => (
    <button type="button" onClick={onClick} style={{
        padding: '0.6rem 0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem',
        transition: 'all 0.2s',
        background: active ? `${color}18` : 'var(--bg-card)',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        color: active ? color : 'var(--text-muted)',
    }}>{label}</button>
);

const QuickCheck = () => {
    const { token } = useAuth();
    const navigate  = useNavigate();
    const [form, setForm] = useState({
        km: '15', transport: 'petrol',
        kwh: '8', diet: 'Non-Vegetarian',
        gas: '2', waste: '1',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saved,   setSaved]   = useState(false);
    const f = v => parseFloat(v) || 0;

    // Instant inline calculation
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
            const res = await axios.post('http://localhost:5000/api/emissions/add', {
                transport_km:    form.km,
                transport_type:  form.transport,
                electricity_kwh: form.kwh,
                diet_type:       form.diet,
                gas_usage:       form.gas,
                waste_kg:        form.waste,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setResult(res.data);
            setSaved(true);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const Row = ({ label, field, unit, step = 1 }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
            <span className="neo-label" style={{ minWidth: 130 }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => setForm(p => ({ ...p, [field]: Math.max(0, +(f(p[field]) - step)).toString() }))}
                    style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                <input type="number" value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: 80, textAlign: 'center', padding: '0.4rem', fontFamily: 'Orbitron, monospace', fontSize: '1rem', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', outline: 'none' }} />
                <button type="button" onClick={() => setForm(p => ({ ...p, [field]: (+(f(p[field]) + step)).toString() }))}
                    style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid var(--accent)', background: 'rgba(0,255,136,0.08)', color: 'var(--accent)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}>+</button>
                <span className="neo-label">{unit}</span>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 760, paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Quick Check</h2>
                <p className="neo-label mt-1">Instant carbon footprint estimate — results update in real-time</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Input panel */}
                <div className="neo-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <p className="neo-label" style={{ marginBottom: '0.75rem' }}>Transport</p>
                        <Row label="Distance" field="km" unit="KM" step={5} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                            {TRANSPORT_TYPES.map(t => (
                                <Btn key={t} label={t} active={form.transport.toLowerCase() === t.toLowerCase()} color="#3B82F6"
                                    onClick={() => setForm(p => ({ ...p, transport: t.toLowerCase() }))} />
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                        <p className="neo-label" style={{ marginBottom: '0.75rem' }}>Energy</p>
                        <Row label="Electricity" field="kwh" unit="KWH" step={2} />
                        <Row label="Gas / Heating" field="gas" unit="M³" step={0.5} />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                        <p className="neo-label" style={{ marginBottom: '0.75rem' }}>Diet</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            {DIET_TYPES.map(t => (
                                <Btn key={t} label={t} active={form.diet === t} color="#00FF88"
                                    onClick={() => setForm(p => ({ ...p, diet: t }))} />
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                        <p className="neo-label" style={{ marginBottom: '0.75rem' }}>Waste</p>
                        <Row label="Refuse" field="waste" unit="KG" step={0.5} />
                    </div>
                </div>

                {/* Live result panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5rem' }}>
                    <div className="neo-card-glow" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <p className="neo-label">Live Estimate</p>
                        <div className="text-glow" style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '3rem', color: 'var(--accent)', margin: '0.5rem 0' }}>
                            {co2.toFixed(2)}
                        </div>
                        <p className="neo-label">KG CO₂E today</p>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {isGood ? <TrendingDown size={16} style={{ color: 'var(--accent)' }} /> : <TrendingUp size={16} style={{ color: '#ef4444' }} />}
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: isGood ? 'var(--accent)' : '#ef4444', fontSize: '0.9rem' }}>
                                {isGood ? 'Below average' : 'Above average'}
                            </span>
                        </div>
                    </div>

                    <div className="neo-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <p className="neo-label">Eco Score</p>
                        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '2.5rem', color: score > 60 ? 'var(--accent)' : '#F59E0B', marginTop: '0.25rem' }}>
                            {score}
                        </div>
                        <p className="neo-label">{score > 60 ? 'Low Impact' : score > 30 ? 'Moderate' : 'High Impact'}</p>
                    </div>

                    <div className="neo-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <p className="neo-label">Trees Needed</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Leaf size={20} style={{ color: 'var(--accent)' }} />
                            <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '2rem', color: 'var(--text)' }}>
                                {Math.ceil(co2 * 7 / 0.42)}
                            </span>
                        </div>
                        <p className="neo-label">to offset weekly</p>
                    </div>

                    {!saved ? (
                        <button onClick={handleSave} disabled={loading} className="btn-neo" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                            <Calculator size={16} /> {loading ? 'Saving...' : 'Save to Dashboard'}
                        </button>
                    ) : (
                        <button onClick={() => navigate('/dashboard')} className="btn-neo" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                            <ArrowRight size={16} /> View Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickCheck;
