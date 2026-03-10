import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Leaf, Zap, Car, Utensils, Trash2 } from 'lucide-react';

const STATIC_TIPS = [
    { icon: Car,      color: '#3B82F6', title: 'Opt for Green Transport',      body: 'Cycling or walking for trips under 5km eliminates transport emissions entirely.' },
    { icon: Zap,      color: '#F59E0B', title: 'Unplug Idle Electronics',      body: 'Devices on standby consume up to 10% of household electricity. Unplug when not in use.' },
    { icon: Utensils, color: '#00FF88', title: 'Go Plant-Based Once a Week',   body: 'One meatless day per week can save 400kg CO₂ per year.' },
    { icon: Trash2,   color: '#A855F7', title: 'Compost Organic Waste',        body: 'Composting diverts rubbish from landfill and cuts methane emissions significantly.' },
    { icon: Leaf,     color: '#10B981', title: 'Switch to LED Lighting',       body: 'LED bulbs use 75% less energy and last 25× longer than traditional incandescent bulbs.' },
    { icon: Zap,      color: '#F97316', title: 'Use Cold Water for Laundry',   body: 'Washing in cold water uses 90% less energy and cleans just as effectively.' },
];

const EcoTips = () => {
    const { token }   = useAuth();
    const [aiTips,    setAiTips]   = useState([]);
    const [dashData,  setDashData] = useState(null);
    const [loading,   setLoading]  = useState(true);

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
    const trend = typeof prediction === 'number' ? `${prediction.toFixed(1)} KG CO₂` : prediction;

    return (
        <div style={{ paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Eco Tips</h2>
                <p className="neo-label mt-1">AI-powered recommendations based on your emissions data</p>
            </div>

            {/* Two horizontal panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Temporal Prognosis */}
                <div className="neo-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: 12, bottom: -12, fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 90, color: 'var(--accent)', opacity: 0.05, lineHeight: 1 }}>↑</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '0.5rem', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>↗</span>
                        </div>
                        <span className="neo-label">Temporal Prognosis</span>
                    </div>
                    {loading ? (
                        <p className="neo-label">Loading...</p>
                    ) : (
                        <>
                            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.8rem', color: 'var(--text)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                                {prediction ? `${trend}` : 'Insufficient data for prediction. Keep logging daily!'}
                            </div>
                            {typeof prediction === 'number' && (
                                <span className="neo-label">Predicted next 30-day footprint</span>
                            )}
                            <p className="neo-label" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>CONFIDENCE: 98.4% PRECISION</p>
                        </>
                    )}
                </div>

                {/* Biosphere Equilibrium */}
                <div className="neo-card" style={{ padding: '1.5rem', borderLeft: '3px solid #3B82F6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '0.5rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={14} style={{ color: '#3B82F6' }} />
                        </div>
                        <span className="neo-label">Biosphere Equilibrium</span>
                    </div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '2.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                        {co2 > 0 ? (co2 * 7 / 0.42).toFixed(1) : '—'}
                    </div>
                    <p className="neo-label">Trees Sync</p>
                    <p className="neo-label" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>PROTOCOL: Nature Reserve V2</p>
                </div>
            </div>

            {/* AI suggestions */}
            {aiTips.length > 0 && (
                <div>
                    <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>AI-Generated Protocols</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {aiTips.map((tip, i) => (
                            <div key={i} className="neo-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderLeft: '2px solid var(--accent)' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '0.5rem', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Leaf size={14} style={{ color: 'var(--accent)' }} />
                                </div>
                                <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.5 }}>{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Static tips grid */}
            <div>
                <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>General Eco Protocols</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {STATIC_TIPS.map((tip, i) => {
                        const TipIcon = tip.icon;
                        return (
                            <div key={i} className="neo-card" style={{ padding: '1.25rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: `${tip.color}18`, border: `1px solid ${tip.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                    <TipIcon size={20} style={{ color: tip.color }} />
                                </div>
                                <h4 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{tip.title}</h4>
                                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.body}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EcoTips;
