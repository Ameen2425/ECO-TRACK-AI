import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { BarChart2, Calendar, Car, Zap, Utensils, Trash2 } from 'lucide-react';

const COLORS = ['#3B82F6', '#F59E0B', '#00FF88', '#A855F7'];

const Reports = () => {
    const { token } = useAuth();
    const [history,   setHistory]   = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [heatmap,   setHeatmap]   = useState(null);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:5000/api/emissions/history',  { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/analytics/',          { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/analytics/heatmap',  { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([h, a, hm]) => {
            setHistory(h.data.map(r => ({ date: r.created_at?.substring(0, 10), co2: r.total_co2 })).reverse());
            setAnalytics(a.data);
            setHeatmap(hm.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    const breakdown = analytics?.category_breakdown ?? {};
    const pieData   = [
        { name: 'Transport', value: breakdown.transport || 0 },
        { name: 'Energy',    value: breakdown.energy    || 0 },
        { name: 'Diet',      value: breakdown.diet      || 0 },
        { name: 'Waste',     value: breakdown.waste     || 0 },
    ].filter(d => d.value > 0);

    const intensityColor = { green: '#00FF88', yellow: '#F59E0B', red: '#EF4444' };

    return (
        <div style={{ paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Reports</h2>
                <p className="neo-label mt-1">Analytical overview of your emission history</p>
            </div>

            {loading ? (
                <div className="neo-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p className="neo-label" style={{ color: 'var(--accent)' }}>Loading analytics...</p>
                </div>
            ) : (
                <>
                    {/* Line chart */}
                    <div className="neo-card" style={{ padding: '1.5rem' }}>
                        <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Emission History</h3>
                        {history.length > 0 ? (
                            <div style={{ height: 260 }}>
                                <ResponsiveContainer>
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fill: 'var(--text-muted)' }} />
                                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontFamily: 'Rajdhani, sans-serif' }} />
                                        <Line type="monotone" dataKey="co2" name="CO₂ (kg)" stroke="var(--accent)" strokeWidth={2.5}
                                            dot={{ fill: 'var(--accent)', r: 4 }} style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.4))' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p className="neo-label">No records yet. Add data to see your trends.</p>
                            </div>
                        )}
                    </div>

                    {/* Category breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Pie */}
                        <div className="neo-card" style={{ padding: '1.5rem' }}>
                            <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Category Breakdown</h3>
                            {pieData.length > 0 ? (
                                <>
                                    <div style={{ height: 180 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={pieData} innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        {pieData.map((d, i) => (
                                            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'Rajdhani, sans-serif' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }}></span>
                                                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.name}</span>
                                                </div>
                                                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{d.value.toFixed(1)} kg</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="neo-label" style={{ textAlign: 'center', paddingTop: '2rem' }}>No data yet</p>
                            )}
                        </div>

                        {/* Bar */}
                        <div className="neo-card" style={{ padding: '1.5rem' }}>
                            <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Last 7 Entries</h3>
                            {history.length > 0 ? (
                                <div style={{ height: 250 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={history.slice(-7)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }} />
                                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontFamily: 'Rajdhani, sans-serif' }} />
                                            <Bar dataKey="co2" name="CO₂ (kg)" fill="var(--accent)" radius={[6, 6, 0, 0]} opacity={0.9} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="neo-label" style={{ textAlign: 'center', paddingTop: '2rem' }}>No data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Monthly Heatmap */}
                    {heatmap && (
                        <div className="neo-card" style={{ padding: '1.5rem' }}>
                            <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Monthly Activity — {heatmap.month}</h3>
                            <p className="neo-label" style={{ marginBottom: '1.25rem' }}>Green = low · Yellow = moderate · Red = high</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {heatmap.data.map((d, i) => (
                                    <div key={i} title={`${d.date}: ${d.footprint} kg CO₂`}
                                        style={{
                                            width: 32, height: 32, borderRadius: '0.4rem', cursor: 'default',
                                            background: d.footprint > 0 ? intensityColor[d.intensity] : 'var(--bg-card)',
                                            border: `1px solid var(--border)`,
                                            opacity: d.footprint > 0 ? 0.8 : 0.3,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.6rem', fontFamily: 'Rajdhani, sans-serif', color: '#000', fontWeight: 700
                                        }}>
                                        {d.date.split('-')[2]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Reports;
