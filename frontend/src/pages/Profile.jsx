import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Leaf, Flame, Target, Activity, LogOut, Edit2, Save } from 'lucide-react';

const Profile = () => {
    const { token, logout } = useAuth();
    const [data,      setData]      = useState(null);
    const [editing,   setEditing]   = useState(false);
    const [username,  setUsername]  = useState('');
    const [email,     setEmail]     = useState('');
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setData(r.data);
        }).catch(console.error).finally(() => setLoading(false));

        // Decode username from JWT
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUsername(payload.username || payload.sub || 'Agent');
            setEmail(payload.email || 'agent@eco-track.ai');
        } catch (_) {}
    }, [token]);

    const co2        = data?.latest?.footprint ?? 0;
    const streak     = data?.intelligence?.streak ?? 0;
    const trees      = data?.intelligence?.offset?.trees_to_offset ?? 0;
    const classObj   = data?.intelligence?.classification;
    const score      = data?.stats?.daily_avg != null ? Math.max(0, Math.round(100 - data.stats.daily_avg * 2)) : 0;
    const classLabel = classObj?.label ?? 'Eco Beginner';
    const classColor = classObj?.color ?? 'var(--accent)';

    const initials = username.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'EA';

    return (
        <div style={{ maxWidth: 800, paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Profile</h2>
                <p className="neo-label mt-1">Agent identity and performance metrics</p>
            </div>

            {/* Avatar + info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(0,255,136,0.1)', border: '3px solid var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '2rem', color: 'var(--accent)',
                        boxShadow: '0 0 20px rgba(0,255,136,0.2)',
                    }}>
                        {initials}
                    </div>
                    <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#00FF88', border: '2px solid var(--bg-base)' }} />
                </div>

                {/* Username / email */}
                <div className="neo-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {editing ? (
                        <>
                            <div>
                                <label className="neo-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Display Name</label>
                                <input value={username} onChange={e => setUsername(e.target.value)}
                                    style={{ padding: '0.6rem 1rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', color: 'var(--text)', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label className="neo-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                                <input value={email} onChange={e => setEmail(e.target.value)}
                                    style={{ padding: '0.6rem 1rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem', color: 'var(--text)', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => setEditing(false)} className="btn-neo" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    <Save size={14} /> Save
                                </button>
                                <button onClick={() => setEditing(false)} className="btn-neo-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)' }}>{username}</div>
                                    <div className="neo-label" style={{ marginTop: '0.25rem' }}>{email}</div>
                                </div>
                                <button onClick={() => setEditing(true)} className="btn-neo-ghost" style={{ padding: '0.4rem 0.6rem' }}>
                                    <Edit2 size={14} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: 9999, background: `${classColor}18`, border: `1px solid ${classColor}44`, color: classColor, fontSize: '0.75rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <Shield size={12} /> {classLabel}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span className="pulse-dot" style={{ background: 'var(--accent)' }}></span>
                                    <span className="neo-label" style={{ color: 'var(--accent)' }}>Online</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                    { icon: Activity, label: 'Last CO₂',   value: co2.toFixed(1),      unit: 'KG', color: '#00FF88', bg: 'rgba(0,255,136,0.08)'   },
                    { icon: Flame,    label: 'Streak',      value: streak,              unit: 'Days', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                    { icon: Target,   label: 'Eco Score',   value: score,               unit: '/100', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
                    { icon: Leaf,     label: 'Trees Needed', value: trees,              unit: 'Trees', color: '#A855F7', bg: 'rgba(168,85,247,0.08)'},
                ].map((s, i) => {
                    const SIcon = s.icon;
                    return (
                        <div key={i} className="neo-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <SIcon size={20} style={{ color: s.color }} />
                            </div>
                            <span className="neo-label" style={{ display: 'block', marginBottom: '0.25rem' }}>{s.label}</span>
                            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text)' }}>{s.value}</div>
                            <span className="neo-label">{s.unit}</span>
                        </div>
                    );
                })}
            </div>

            {/* Account section */}
            <div className="neo-card" style={{ padding: '1.5rem' }}>
                <h3 className="neo-heading" style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Account Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <User size={16} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text)', fontSize: '0.9rem' }}>Account Type</span>
                        </div>
                        <span className="badge-green">Free Agent</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text)', fontSize: '0.9rem' }}>Email Verified</span>
                        </div>
                        <span className="badge-green">Verified</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Shield size={16} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text)', fontSize: '0.9rem' }}>Data Privacy</span>
                        </div>
                        <span className="badge-green">Encrypted</span>
                    </div>
                </div>
            </div>

            {/* Logout */}
            <button onClick={logout} className="btn-neo-ghost"
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}>
                <LogOut size={16} /> Sign Out
            </button>
        </div>
    );
};

export default Profile;
