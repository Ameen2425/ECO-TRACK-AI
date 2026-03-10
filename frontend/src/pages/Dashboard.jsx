import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingDown, TrendingUp, Download, Activity, Leaf, Target, Flame, RefreshCw
} from 'lucide-react';

// Score ring using SVG – color reflects score
const ScoreRing = ({ score = 0 }) => {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const pct  = Math.min(100, Math.max(0, score));
    const color = pct <= 40 ? '#00FF88' : pct <= 70 ? '#F59E0B' : '#EF4444';
    const offset = circ - (pct / 100) * circ;
    return (
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color}99)`, transition: 'stroke-dashoffset 1s ease' }}
                />
            </svg>
            <div className="absolute text-center">
                <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '2rem', color: 'var(--text)' }}>
                    {score}
                </div>
                <div className="neo-label">Score</div>
            </div>
        </div>
    );
};

const COLORS = ['#00FF88', '#3B82F6', '#F59E0B', '#A855F7'];

const StatCard = ({ icon: Icon, label, value, unit, iconColor, iconBg }) => (
    <div className="neo-card p-6 flex items-center gap-5">
        <div style={{ width: 52, height: 52, borderRadius: '0.875rem', background: iconBg, border: `1px solid ${iconColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={22} style={{ color: iconColor }} />
        </div>
        <div>
            <p className="neo-label mb-1">{label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.8rem', color: 'var(--text)' }}>{value}</span>
                <span className="neo-label">{unit}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const { token }             = useAuth();
    const location              = useLocation();

    const fetchData = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setData(r.data);
        }).catch(() => {
            setData(null);
        }).finally(() => setLoading(false));
    }, [token]);

    // Re-fetch every time user navigates to this page
    useEffect(() => { fetchData(); }, [fetchData, location.key]);

    // Map backend fields to UI variables
    const co2        = data?.latest?.footprint ?? 0;
    const score      = data?.stats?.daily_avg != null
                        ? Math.max(0, Math.round(100 - data.stats.daily_avg * 2))
                        : co2 > 0 ? Math.max(0, Math.round(100 - co2 * 2)) : 0;
    const streak     = data?.intelligence?.streak ?? 0;
    const trees      = data?.intelligence?.offset?.trees_to_offset ?? Math.max(1, Math.round(co2 / 0.06 / 7));
    const dailyAvg   = data?.stats?.daily_avg ?? 0;
    const classLabel = data?.intelligence?.classification?.label ?? (co2 === 0 ? 'No Data' : 'Moderate Impact');
    const classDesc  = data?.intelligence?.classification?.description ?? 'Log your first entry.';
    const history    = (data?.history ?? []).map(h => ({ date: h.date?.substring(0,10), co2: h.footprint })).reverse();
    const risks      = data?.intelligence?.risks ?? [];
    const isGood     = co2 < 15;
    const statusText = co2 === 0 ? 'No Data Yet' : isGood ? 'Optimized' : 'High Load';
    const trendPct   = data?.stats?.daily_avg != null && co2 > 0
                        ? Math.round(((co2 - data.stats.daily_avg) / Math.max(data.stats.daily_avg, 1)) * 100)
                        : 0;

    const pieData = data?.breakdown ? [
        { name: 'Transport', value: data.breakdown.transport  || 0 },
        { name: 'Energy',    value: data.breakdown.energy     || 0 },
        { name: 'Diet',      value: data.breakdown.diet       || 0 },
        { name: 'Waste',     value: data.breakdown.waste      || 0 },
    ] : [
        { name: 'Transport', value: 35 },
        { name: 'Energy',    value: 45 },
        { name: 'Diet',      value: 15 },
        { name: 'Waste',     value: 5  },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>

            {/* ── Heading row ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Mission Dashboard</h2>
                    <p className="neo-label mt-1">Eco-Intelligence Terminal V2.4.0</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={fetchData}
                        className="btn-neo-ghost" title="Refresh data"
                        style={{ padding: '0.5rem 0.75rem' }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button type="button" className="btn-neo">
                        <Download size={16} /> Download PDF Report
                    </button>
                </div>
            </div>

            {/* ── Today's CO2 + Score ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>

                {/* Carbon Footprint card */}
                <div className="neo-card-glow" style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem' }}>
                    {/* Watermark */}
                    <div style={{
                        position: 'absolute', right: 16, bottom: -8,
                        fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: 120,
                        color: 'var(--accent)', opacity: 0.04, userSelect: 'none', lineHeight: 1,
                    }}>e</div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                        <div>
                            <p className="neo-label">Live Emission Telemetry</p>
                            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)', marginTop: '0.25rem' }}>
                                Daily Carbon Footprint
                            </h3>
                        </div>
                        <button type="button" style={{
                            width: 40, height: 40, borderRadius: '0.75rem',
                            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
                            color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>
                            <Activity size={18} />
                        </button>
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                            <span className="text-glow" style={{
                                fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '4rem', color: 'var(--accent)'
                            }}>{co2.toFixed(2)}</span>
                            <span className="neo-label" style={{ fontSize: '1rem' }}>KG CO2E</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isGood ? <TrendingDown size={16} style={{ color: 'var(--accent)' }} />
                                    : <TrendingUp   size={16} style={{ color: '#ef4444' }} />}
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: isGood ? 'var(--accent)' : '#ef4444' }}>
                                {trendPct > 0 ? '+' : ''}{trendPct}%
                            </span>
                            <span className="neo-label">VS Laboratory Baseline</span>
                        </div>
                        <div className={co2 === 0 ? 'badge-yellow' : isGood ? 'badge-green' : 'badge-red'}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                            Status: {statusText}
                        </div>
                    </div>
                </div>

                {/* Score ring card */}
                <div className="neo-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <ScoreRing score={score} />
                    <div className="neo-card" style={{ width: '100%', padding: '0.75rem', textAlign: 'center', borderColor: 'rgba(0,255,136,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Leaf size={14} style={{ color: 'var(--accent)' }} />
                            <span style={{ color: 'var(--accent)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                {classLabel}
                            </span>
                        </div>
                        <p className="neo-label">{classDesc}</p>
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                <StatCard icon={Flame}    label="Eco Vitality Streak"    value={streak}          unit="Days"         iconColor="#00FF88" iconBg="rgba(0,255,136,0.1)" />
                <StatCard icon={Target}   label="Tree Offset Equivalent"  value={trees}           unit="Trees Needed" iconColor="#3B82F6" iconBg="rgba(59,130,246,0.1)" />
                <StatCard icon={Activity} label="Daily Avg Footprint"     value={dailyAvg.toFixed(1)} unit="KG CO2"  iconColor="#F59E0B" iconBg="rgba(245,158,11,0.1)" />
            </div>

            {/* ── Charts row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>

                {/* Trend line */}
                <div className="neo-card" style={{ padding: '1.5rem' }}>
                    <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Emission Trend — History</h3>
                    {history.length > 0 ? (
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer>
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fill: 'var(--text-muted)' }} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        borderRadius: 12, color: 'var(--text)', fontFamily: 'Rajdhani, sans-serif'
                                    }} />
                                    <Line type="monotone" dataKey="co2" stroke="var(--accent)" strokeWidth={2.5}
                                        dot={{ fill: 'var(--accent)', r: 4 }}
                                        style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.4))' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                            <Activity size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                            <p className="neo-label" style={{ textAlign: 'center' }}>No history yet.<br />Add your first emission entry.</p>
                            <Link to="/add-data" className="btn-neo" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Add Data Now</Link>
                        </div>
                    )}
                </div>

                {/* Pie */}
                <div className="neo-card" style={{ padding: '1.5rem' }}>
                    <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Sector Matrix</h3>
                    <div style={{ height: 160 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]}
                                            style={{ filter: i === 0 ? 'drop-shadow(0 0 4px rgba(0,255,136,0.5))' : 'none' }} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {pieData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'Rajdhani, sans-serif' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }}></span>
                                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.name}</span>
                                </div>
                                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Quick action ── */}
            <div className="neo-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '1.1rem', color: 'var(--text)' }}>
                        Log Today's Activity
                    </h3>
                    <p className="neo-label mt-1">Sync your environmental impact data to the dashboard</p>
                </div>
                <Link to="/add-data" className="btn-neo">
                    <Activity size={16} /> Sync Data
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
