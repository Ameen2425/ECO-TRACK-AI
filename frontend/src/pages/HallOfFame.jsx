import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Award, Leaf, Star } from 'lucide-react';

const BADGES = [
    { label: 'Eco Champion',   min: 80, icon: Trophy, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'  },
    { label: 'Green Leader',   min: 60, icon: Medal,  color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.3)'  },
    { label: 'Low Impact',     min: 40, icon: Leaf,   color: '#00FF88', bg: 'rgba(0,255,136,0.1)',   border: 'rgba(0,255,136,0.3)'   },
    { label: 'Eco Beginner',   min: 0,  icon: Star,   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)'  },
];

function getBadge(score) {
    return BADGES.find(b => score >= b.min) ?? BADGES[BADGES.length - 1];
}

// Mock leaderboard data — ideally fetched from backend
const MOCK_BOARD = [
    { rank: 1,  username: 'GreenWarden',   score: 94, streak: 21, badge: 'Eco Champion'  },
    { rank: 2,  username: 'SolarPilot',    score: 88, streak: 17, badge: 'Eco Champion'  },
    { rank: 3,  username: 'NatureSentry',  score: 82, streak: 14, badge: 'Eco Champion'  },
    { rank: 4,  username: 'TerraGuard',    score: 77, streak: 11, badge: 'Green Leader'  },
    { rank: 5,  username: 'AquaVeil',      score: 71, streak:  9, badge: 'Green Leader'  },
    { rank: 6,  username: 'WindCipher',    score: 66, streak:  7, badge: 'Green Leader'  },
    { rank: 7,  username: 'Orbit_42',      score: 58, streak:  5, badge: 'Low Impact'    },
    { rank: 8,  username: 'BiomeCrypt',    score: 49, streak:  3, badge: 'Low Impact'    },
    { rank: 9,  username: 'EcoNode_9',     score: 41, streak:  2, badge: 'Low Impact'    },
    { rank: 10, username: 'PixelSprout',   score: 33, streak:  1, badge: 'Eco Beginner'  },
];

const rankColors = ['#FBBF24', '#94A3B8', '#F97316'];

const HallOfFame = () => {
    const { token } = useAuth();
    const [myScore, setMyScore] = useState(null);
    const [myName,  setMyName]  = useState('You');

    useEffect(() => {
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            const co2 = r.data?.latest?.footprint ?? 0;
            const avg = r.data?.stats?.daily_avg ?? co2;
            setMyScore(Math.max(0, Math.round(100 - avg * 2)));
        }).catch(console.error);

        // Try to get username from JWT payload
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setMyName(payload.username || payload.sub || 'You');
        } catch (_) {}
    }, [token]);

    const allEntries = myScore != null
        ? [...MOCK_BOARD.slice(0, 9), { rank: '—', username: myName, score: myScore, streak: '—', badge: getBadge(myScore).label, isMe: true }]
            .sort((a, b) => b.score - a.score)
            .map((e, i) => ({ ...e, rank: i + 1 }))
        : MOCK_BOARD;

    return (
        <div style={{ paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 860 }}>
            <div>
                <h2 className="neo-heading" style={{ fontSize: '1.8rem' }}>Hall of Fame</h2>
                <p className="neo-label mt-1">Global Eco Warriors Leaderboard</p>
            </div>

            {/* Top 3 podium */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {[allEntries[1], allEntries[0], allEntries[2]].map((entry, pos) => {
                    if (!entry) return null;
                    const b = getBadge(entry.score);
                    const BadgeIcon = b.icon;
                    const podiumSize = pos === 1 ? '1.1rem' : '0.95rem';
                    const podiumPad  = pos === 1 ? '1.75rem 1.5rem' : '1.25rem';
                    const medalColor = pos === 1 ? '#FBBF24' : pos === 0 ? '#94A3B8' : '#F97316';
                    const realRank   = pos === 1 ? 1 : pos === 0 ? 2 : 3;
                    return (
                        <div key={pos} className={entry.isMe ? 'neo-card-glow' : 'neo-card'}
                            style={{ padding: podiumPad, textAlign: 'center', marginTop: pos === 1 ? 0 : '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            {/* Rank badge */}
                            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.8rem', color: medalColor, marginBottom: '0.5rem' }}>
                                #{realRank}
                            </div>
                            {/* Avatar */}
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: b.bg, border: `2px solid ${b.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <BadgeIcon size={24} style={{ color: b.color }} />
                            </div>
                            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: podiumSize, color: 'var(--text)' }}>{entry.username}</p>
                            <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 900, fontSize: '1.8rem', color: 'var(--accent)', margin: '0.25rem 0' }}>{entry.score}</div>
                            <span className="badge-green" style={{ display: 'inline-flex', margin: '0 auto', fontSize: '0.65rem' }}>{b.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Full table */}
            <div className="neo-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 1fr', gap: '0.5rem' }}>
                    {['Rank', 'Username', 'Score', 'Streak', 'Badge'].map(h => (
                        <span key={h} className="neo-label">{h}</span>
                    ))}
                </div>
                {allEntries.map((entry, i) => {
                    const b = getBadge(entry.score);
                    const BadgeIcon = b.icon;
                    const isTop3 = i < 3;
                    return (
                        <div key={i} style={{
                            padding: '0.9rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 1fr', gap: '0.5rem',
                            alignItems: 'center',
                            background: entry.isMe ? 'rgba(0,255,136,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                            borderLeft: entry.isMe ? '2px solid var(--accent)' : 'none',
                        }}>
                            <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, color: isTop3 ? rankColors[i] : 'var(--text-muted)', fontSize: '0.9rem' }}>#{entry.rank}</span>
                            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: entry.isMe ? 'var(--accent)' : 'var(--text)', fontSize: '0.9rem' }}>
                                {entry.username} {entry.isMe && '← You'}
                            </span>
                            <span style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>{entry.score}</span>
                            <span className="neo-label">{entry.streak} days</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <BadgeIcon size={14} style={{ color: b.color }} />
                                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.78rem', color: b.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{b.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HallOfFame;
