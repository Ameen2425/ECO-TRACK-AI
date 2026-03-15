import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Leaf, Star, User, Zap, Mail, Shield, Award, Flame, Target as TargetIcon, ArrowRight, Settings as SettingsIcon, LogOut, Activity, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGES = [
    { label: 'Eco Legend',     min: 90, icon: Trophy, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)', desc: 'Top 1% of environmentalists' },
    { label: 'Green Guardian', min: 70, icon: Medal,  color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.2)', desc: 'Significant reduction archive' },
    { label: 'Eco Warrior',    min: 50, icon: Leaf,   color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', desc: 'Active sustainability tracker' },
    { label: 'Earth Citizen',  min: 0,  icon: Star,   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)', desc: 'Starting the green journey' },
];

function getBadge(score) {
    return BADGES.find(b => score >= b.min) ?? BADGES[BADGES.length - 1];
}

const MOCK_BOARD = [
    { rank: 1,  username: 'EcoArchitect',   score: 96, badge: 'Eco Champion', is_me: false },
    { rank: 2,  username: 'SolarSystem',    score: 89, badge: 'Eco Champion', is_me: false },
    { rank: 3,  username: 'CarbonCipher',   score: 84, badge: 'Eco Champion', is_me: false },
    { rank: 4,  username: 'GreenMatrix',    score: 75, badge: 'Green Leader', is_me: false },
    { rank: 5,  username: 'DeepEco',        score: 68, badge: 'Green Leader', is_me: false },
];

const rankColors = ['#FBBF24', '#94A3B8', '#F97316'];

const HallOfFame = () => {
    const { token } = useAuth();
    const [board,   setBoard]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/analytics/leaderboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setBoard(r.data && r.data.length > 0 ? r.data : MOCK_BOARD);
        }).catch(() => {
            setBoard(MOCK_BOARD);
        }).finally(() => setLoading(false));
    }, [token]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-10 pb-12 max-w-4xl transition-all duration-500"
        >
            <div className="space-y-1">
                <h2 className="neo-heading text-2xl font-bold tracking-tight text-text-light dark:text-text-dark">Eco Leaderboard</h2>
                <p className="neo-label font-medium opacity-60 italic">Top performers in our green community</p>
            </div>

            {loading ? (
                <div className="neo-card p-12 flex flex-col items-center justify-center gap-4 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary-light/20 border-t-primary-light rounded-full animate-spin" />
                    <p className="neo-label font-bold text-primary-light opacity-80 uppercase tracking-widest text-[10px]">Loading leaderboard...</p>
                </div>
            ) : (
                <>
                    {/* Top 3 podium */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-12">
                        {[board[1], board[0], board[2]].map((entry, pos) => {
                            if (!entry) return null;
                            const b = getBadge(entry.score);
                            const BadgeIcon = b.icon;
                            
                            const realRank = pos === 1 ? 1 : pos === 0 ? 2 : 3;
                            const heightClass = pos === 1 ? 'h-[320px]' : pos === 0 ? 'h-[280px]' : 'h-[260px]';
                            const borderColor = realRank === 1 ? 'border-yellow-400' : realRank === 2 ? 'border-slate-400' : 'border-orange-400';
                            
                            return (
                                <div key={pos} 
                                    className={`relative flex-1 group transition-all duration-700 ${entry.is_me ? 'scale-[1.03] z-20' : 'z-10'}`}>
                                    
                                    {/* Podium Base */}
                                    <div className={`neo-card w-full ${heightClass} flex flex-col items-center justify-end pb-8 gap-4 border-b-8 shadow-2xl relative overflow-hidden transition-all group-hover:shadow-primary-light/5`}
                                        style={{ borderBottomColor: borderColor }}>
                                        
                                        {/* Background Rank Decor */}
                                        <div className="absolute top-10 left-1/2 -translate-x-1/2 font-inter font-black text-9xl text-current opacity-[0.03] pointer-events-none italic">
                                            {realRank}
                                        </div>

                                        <div className="flex flex-col items-center gap-3 relative z-10 px-4">
                                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center border-2 shadow-inner transition-transform duration-500 group-hover:rotate-12"
                                                style={{ background: b.bg, borderColor: b.border }}>
                                                <BadgeIcon size={32} style={{ color: b.color }} />
                                            </div>
                                            
                                            <div className="space-y-0 text-center">
                                                <p className={`font-inter font-black text-lg truncate max-w-[140px] leading-tight ${entry.is_me ? 'text-primary-light' : 'text-text-light dark:text-text-dark'}`}>
                                                    {entry.username}
                                                </p>
                                                <p className="text-[10px] font-black italic opacity-40 uppercase tracking-widest">{b.label}</p>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="h-1 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                                <div className="font-inter font-black text-3xl text-text-light dark:text-text-dark tracking-tighter">
                                                    {entry.score}
                                                </div>
                                                <div className="h-1 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medal Indicator */}
                                    <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full border-4 bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg z-30"
                                        style={{ borderColor: borderColor }}>
                                        <span className="text-xs font-black italic">#{realRank}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Full table */}
                    <div className="neo-card shadow-xl overflow-hidden border-t-4 border-t-eco-green">
                        <div className="px-10 py-6 border-b border-eco-border bg-gray-50/30 dark:bg-gray-900/30 grid grid-cols-[80px_1fr_120px_200px] gap-6">
                            {['Rank', 'Environmentalist', 'Eco Score', 'Status Badge'].map(h => (
                                <span key={h} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{h}</span>
                            ))}
                        </div>
                        <div className="divide-y divide-border">
                            {board.map((entry, i) => {
                                const b = getBadge(entry.score);
                                const BadgeIcon = b.icon;
                                const isTop3 = i < 3;
                                return (
                                    <div key={i} className={`px-10 py-6 grid grid-cols-[80px_1fr_120px_200px] gap-6 items-center transition-all duration-300 ${entry.is_me ? 'bg-eco-green/5 border-l-4 border-l-eco-green' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}>
                                        <span className={`font-inter font-black italic ${isTop3 ? 'text-2xl' : 'text-sm'}`} 
                                            style={{ color: isTop3 ? rankColors[i] : 'var(--text-muted)' }}>
                                            {isTop3 ? `#${entry.rank}` : entry.rank}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className={`font-inter font-bold text-sm tracking-tight ${entry.is_me ? 'text-eco-green' : 'text-text-light dark:text-text-dark'}`}>
                                                {entry.username}
                                            </span>
                                            {entry.is_me && <span className="text-[9px] font-bold text-eco-green uppercase tracking-widest opacity-60">Your Identity</span>}
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-inter font-black text-xl text-text-light dark:text-text-dark tracking-tighter">{entry.score}</span>
                                            <span className="text-[9px] font-bold opacity-30 italic">PTS</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500 hover:scale-110" style={{ color: b.color, background: b.bg, borderColor: b.border }}>
                                                <BadgeIcon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: b.color }}>{b.label}</span>
                                                <span className="text-[8px] font-medium opacity-40 uppercase tracking-tighter mt-1">{b.desc}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default HallOfFame;
