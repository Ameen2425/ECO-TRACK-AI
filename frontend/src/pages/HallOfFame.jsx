import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Trophy, Medal, Leaf, Star, User, Zap, Mail, Shield, 
    Award, Flame, Target as TargetIcon, ArrowRight, 
    Settings as SettingsIcon, LogOut, Activity, Camera,
    ChevronRight, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BADGES = [
    { label: 'Eco Legend',     min: 90, icon: Trophy, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)', desc: 'Top 1% of environmentalists' },
    { label: 'Green Guardian', min: 70, icon: Medal,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)', desc: 'Significant reduction archive' },
    { label: 'Eco Warrior',    min: 50, icon: Leaf,   color: '#16A34A', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.2)',  desc: 'Active sustainability tracker' },
    { label: 'Earth Citizen',  min: 0,  icon: Star,   color: '#2563EB', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.2)',  desc: 'Starting the green journey' },
];

function getBadge(score) {
    return BADGES.find(b => score >= b.min) ?? BADGES[BADGES.length - 1];
}

const rankColors = ['#FBBF24', '#94A3B8', '#F97316'];

const HallOfFame = () => {
    const { token } = useAuth();
    const [board,   setBoard]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:5000/api/analytics/leaderboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
            setBoard(r.data);
        }).catch(() => {
            setBoard([]);
        }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-eco-green animate-pulse">Syncing Rankings...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8 pb-12 max-w-5xl"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-text-light dark:text-text-dark">Eco Leaderboard</h2>
                    <p className="text-xs text-text-muted mt-1 uppercase tracking-widest opacity-60 font-bold">Global Sustainability Rankings</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-eco-green/10 border border-eco-green/20">
                    <Globe size={14} className="text-eco-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-eco-green">Worldwide Community</span>
                </div>
            </div>

            {board.length === 0 ? (
                <div className="neo-card p-16 text-center space-y-4">
                    <Trophy size={48} className="mx-auto text-text-muted opacity-20" />
                    <p className="font-bold text-text-muted">No rankings available yet.</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-8 mt-12 px-4">
                        {[board[1], board[0], board[2]].map((entry, pos) => {
                            if (!entry) return <div key={pos} className="flex-1 hidden md:block" />;
                            const b = getBadge(entry.score);
                            const BadgeIcon = b.icon;
                            
                            const realRank = pos === 1 ? 1 : pos === 0 ? 2 : 3;
                            const heightClass = pos === 1 ? 'h-[320px]' : pos === 0 ? 'h-[280px]' : 'h-[240px]';
                            const borderColor = realRank === 1 ? '#FBBF24' : realRank === 2 ? '#94A3B8' : '#F97316';
                            const glowColor = realRank === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(148,163,184,0.2)';
                            
                            return (
                                <motion.div 
                                    key={pos} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: pos * 0.1 }}
                                    className={`relative flex-1 group w-full ${entry.is_me ? 'z-20' : 'z-10'}`}
                                >
                                    <div className={`neo-card w-full ${heightClass} flex flex-col items-center justify-end pb-10 gap-5 border-b-[6px] shadow-2xl relative overflow-hidden transition-all duration-500 hover:translate-y-[-8px]`}
                                        style={{ borderBottomColor: borderColor, boxShadow: `0 20px 40px -15px ${glowColor}` }}>
                                        
                                        <div className="absolute top-12 left-1/2 -translate-x-1/2 font-black text-[120px] opacity-[0.04] pointer-events-none italic" style={{ color: borderColor }}>
                                            {realRank}
                                        </div>

                                        <div className="flex flex-col items-center gap-4 relative z-10 px-4 text-center">
                                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center border-2 shadow-inner transition-transform duration-700 group-hover:rotate-[360deg]"
                                                style={{ background: b.bg, borderColor: b.border }}>
                                                <BadgeIcon size={32} style={{ color: b.color }} />
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h4 className={`font-black text-lg tracking-tight truncate max-w-[150px] ${entry.is_me ? 'text-eco-green' : 'text-text-light dark:text-text-dark'}`}>
                                                    {entry.username}
                                                </h4>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-eco-border bg-gray-50 dark:bg-gray-800" style={{ color: b.color }}>
                                                    {b.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="h-0.5 w-6 bg-eco-border rounded-full" />
                                                <span className="font-black text-3xl tracking-tighter text-text-light dark:text-text-dark">
                                                    {entry.score}
                                                </span>
                                                <div className="h-0.5 w-6 bg-eco-border rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -top-4 -right-2 w-10 h-10 rounded-2xl border-2 bg-white dark:bg-gray-900 flex items-center justify-center shadow-xl z-30 font-black italic text-xs"
                                        style={{ borderColor: borderColor, color: borderColor }}>
                                        #{realRank}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Full List */}
                    <div className="neo-card shadow-xl overflow-hidden border-t-4 border-t-eco-green">
                        <div className="hidden sm:grid grid-cols-[80px_1fr_120px_200px] gap-6 px-10 py-6 border-b border-eco-border bg-gray-50/50 dark:bg-gray-900/30">
                            {['Rank', 'Environmentalist', 'Eco Score', 'Badge'].map(h => (
                                <span key={h} className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40">{h}</span>
                            ))}
                        </div>
                        <div className="divide-y divide-eco-border">
                            {board.map((entry, i) => {
                                const b = getBadge(entry.score);
                                const Icon = b.icon;
                                const isTop3 = i < 3;
                                return (
                                    <div key={i} className={`px-6 sm:px-10 py-5 transition-all duration-300 flex flex-col sm:grid sm:grid-cols-[80px_1fr_120px_200px] gap-4 sm:gap-6 items-center ${entry.is_me ? 'bg-eco-green/5' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'}`}>
                                        <div className="flex items-center justify-between w-full sm:w-auto">
                                            <span className={`font-black italic text-lg sm:text-2xl ${isTop3 ? 'opacity-100' : 'opacity-30'}`} 
                                                style={{ color: isTop3 ? rankColors[i] : 'inherit' }}>
                                                #{entry.rank}
                                            </span>
                                            {/* Mobile only score */}
                                            <span className="sm:hidden font-black text-eco-green">{entry.score} pts</span>
                                        </div>

                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-eco-border">
                                                <User size={18} className="text-text-muted" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className={`font-black tracking-tight truncate ${entry.is_me ? 'text-eco-green' : 'text-text-light dark:text-text-dark'}`}>
                                                    {entry.username}
                                                </span>
                                                {entry.is_me && <span className="text-[9px] font-black text-eco-green uppercase tracking-widest">Your Account</span>}
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex items-baseline gap-1">
                                            <span className="font-black text-xl tracking-tighter">{entry.score}</span>
                                            <span className="text-[10px] font-bold opacity-30 italic">PTS</span>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ color: b.color, background: b.bg, borderColor: b.border }}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: b.color }}>{b.label}</span>
                                                <span className="text-[8px] font-medium opacity-40 uppercase tracking-tighter truncate max-w-[120px]">{b.desc}</span>
                                            </div>
                                            <ChevronRight size={12} className="ml-auto text-text-muted opacity-30" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="neo-card p-6 border-l-4 border-eco-green flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green">
                                <Leaf size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Offset</p>
                                <h4 className="font-black text-xl tracking-tight">12,450 kg</h4>
                            </div>
                        </div>
                        <div className="neo-card p-6 border-l-4 border-analytics-blue flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-analytics-blue/10 flex items-center justify-center text-analytics-blue">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Active Heros</p>
                                <h4 className="font-black text-xl tracking-tight">1,248</h4>
                            </div>
                        </div>
                        <div className="neo-card p-6 border-l-4 border-amber-500 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Avg Eco Score</p>
                                <h4 className="font-black text-xl tracking-tight">64.5</h4>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default HallOfFame;
