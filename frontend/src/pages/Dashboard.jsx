import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
    Activity, Leaf, TrendingDown, TrendingUp, Download,
    RefreshCw, Zap, Target, Globe, BarChart3, PlusCircle,
    Trophy, ArrowUpRight, ArrowDownRight, Trees, Flame, Users
} from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';

const PRINT_STYLE_ID = 'eco-print-style';
if (!document.getElementById(PRINT_STYLE_ID)) {
    const s = document.createElement('style');
    s.id = PRINT_STYLE_ID;
    s.textContent = `@media print { .neo-sidebar, nav, header { display: none !important; } body { background: #fff !important; } }`;
    document.head.appendChild(s);
}

const ScoreRing = ({ score }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const pct  = Math.min(100, Math.max(0, score));
    const color = pct >= 70 ? 'var(--eco-primary)' : pct >= 40 ? '#F59E0B' : '#EF4444';
    const offset = circ - (pct / 100) * circ;
    return (
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r={r} className="stroke-gray-100 dark:stroke-gray-800 fill-none" strokeWidth="9" />
                <circle cx="70" cy="70" r={r} className="fill-none transition-all duration-1000" strokeWidth="9"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    stroke={color} style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
                <span className="font-inter font-black text-3xl tracking-tighter" style={{ color }}>{pct}</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">Score</span>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, unit, icon: Icon, trend, color = 'green', description, onClick }) => (
    <div className={`neo-card p-5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 cursor-default ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${color === 'green' ? 'bg-eco-green/10 border-eco-green/20 text-eco-green' : 'bg-analytics-blue/10 border-analytics-blue/20 text-analytics-blue'}`}>
                <Icon size={18} />
            </div>
            {trend != null && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${trend > 0 ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-eco-green/10 text-eco-green'}`}>
                    {trend > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="font-inter font-black text-2xl tracking-tighter text-text-light dark:text-text-dark">{value}</h3>
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{unit}</span>
            </div>
            {description && <p className="text-[9px] font-medium opacity-50 italic">{description}</p>}
        </div>
    </div>
);

const InsightBanner = ({ icon: Icon, color, text }) => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
        style={{ background: `${color}08`, borderColor: `${color}20` }}>
        <Icon size={16} style={{ color }} className="shrink-0" />
        <p className="text-[10px] font-medium text-text-muted leading-relaxed">{text}</p>
    </div>
);

const PIE_COLORS = ['#2563EB', '#16A34A', '#059669', '#0284C7', '#10B981'];

const Dashboard = () => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const location  = useLocation();

    const fetchData = useCallback(() => {
        setLoading(true);
        axios.get('http://localhost:5000/api/emissions/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData, location.key]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const latest       = data?.latest;
    const stats        = data?.stats;
    const intelligence = data?.intelligence;
    const weekly       = data?.weekly;
    const monthly      = data?.monthly;
    const co2          = latest?.footprint ?? 0;
    const score        = stats?.score ?? Math.max(0, Math.round(100 - (stats?.daily_avg ?? co2) * 2));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full" 
            />
            <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-black uppercase tracking-widest text-eco-green"
            >
                Loading Intelligence...
            </motion.p>
        </div>
    );

    if (!data || !latest) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center min-h-[500px] gap-8 text-center"
            >
                <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-20 h-20 rounded-3xl bg-eco-green/10 flex items-center justify-center border border-eco-green/20"
                >
                    <Leaf size={36} className="text-eco-green" />
                </motion.div>
                <div className="space-y-2">
                    <h3 className="font-black text-2xl tracking-tight text-text-light dark:text-text-dark">No Data Streams Found</h3>
                    <p className="text-sm text-text-muted">Initialize your carbon tracking journey today.</p>
                </div>
                <Link to="/add-data" className="btn-neo px-8 py-3 shadow-lg shadow-eco-green/20">
                    <PlusCircle size={16} /><span className="font-black uppercase tracking-widest text-[10px]">Add Entry</span>
                </Link>
            </motion.div>
        );
    }

    const history      = (data?.history ?? []).map(h => ({ date: h.date?.substring(0, 10), co2: h.footprint })).reverse();
    const suggestions  = data?.suggestions ?? [];
    const highestCat   = stats?.highest_category ?? '—';
    const profileType  = stats?.profile_type ?? '';

    // Weekly bar data
    const barData = weekly ? [
        { name: 'Last Week', co2: weekly.last_week },
        { name: 'This Week', co2: weekly.this_week },
    ] : [];

    const pieData = [
        { name: 'Transport',   value: Math.max(0, (co2 * 0.35)) },
        { name: 'Electricity', value: Math.max(0, (co2 * 0.30)) },
        { name: 'Gas',         value: Math.max(0, (co2 * 0.15)) },
        { name: 'Waste',       value: Math.max(0, (co2 * 0.08)) },
        { name: 'Diet',        value: Math.max(0, (co2 * 0.12)) },
    ];

    const PROFILE_COLORS = {
        'Climate Conscious': 'text-eco-green bg-eco-green/10 border-eco-green/20',
        'Low Impact User':   'text-blue-500 bg-blue-500/10 border-blue-500/20',
        'Moderate Impact User': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        'High Impact User':  'text-red-500 bg-red-500/10 border-red-500/20',
    };

    const handleExport = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/emissions/history', { headers: { Authorization: `Bearer ${token}` } });
            const exportData = res.data.map(item => ({
                Date:              new Date(item.created_at).toLocaleDateString(),
                'Transport (km)':  item.transport_km,
                'Transport Type':  item.transport_type,
                'Total CO₂ (kg)':  item.total_co2,
            }));
            downloadCSV(exportData, 'EcoTrack_Export.csv');
        } catch { alert("Export failed."); }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 pb-12"
        >

            {/* Action Bar */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl border border-eco-border gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-eco-green/10 border border-eco-green/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-eco-green">Intelligence Active</span>
                    </div>
                    {profileType && (
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${PROFILE_COLORS[profileType] || 'text-text-muted bg-gray-100 border-eco-border'}`}>
                            {profileType}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} onClick={fetchData} className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-eco-border flex items-center justify-center text-text-muted hover:text-eco-green transition-all">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport} className="flex-1 sm:flex-none btn-neo px-5 py-2 bg-eco-green text-white shadow-lg shadow-eco-green/20 text-[10px]">
                        <Download size={14} /> Export
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                        <Link to="/add-data" className="btn-neo px-5 py-2 shadow-lg text-[10px] block text-center">
                            <PlusCircle size={14} /> Add Entry
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}><MetricCard label="Total Footprint" value={co2.toFixed(1)} unit="kg" icon={Leaf} color="green" /></motion.div>
                <motion.div variants={itemVariants}><MetricCard label="Eco Score" value={score} unit="pts" icon={Target} color="green" /></motion.div>
                <motion.div variants={itemVariants}><MetricCard label="Annual Offset" value={intelligence?.offset?.trees_to_offset ?? 0} unit="trees" icon={Globe} color="blue" /></motion.div>
                <motion.div variants={itemVariants}><MetricCard label="Main Impact" value={highestCat} unit="" icon={Flame} color="blue" /></motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 neo-card p-5 md:p-8 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest">Emission Trajectory</h3>
                        <Activity size={16} className="text-analytics-blue" />
                    </div>
                    <div className="h-56 sm:h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                <Area type="monotone" dataKey="co2" stroke="#2563EB" strokeWidth={2.5} fill="url(#areaBlue)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="neo-card p-5 md:p-8 flex flex-col gap-5 text-center items-center justify-center">
                    <h4 className="font-black text-xs uppercase tracking-widest opacity-40 self-start">Eco Efficiency</h4>
                    <ScoreRing score={score} />
                    <p className="text-[10px] font-black text-eco-green uppercase tracking-widest mt-4">
                        {intelligence?.classification?.label ?? 'Optimizing...'}
                    </p>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { to: '/add-data', icon: PlusCircle, label: 'Add Entry', color: 'eco-green' },
                    { to: '/reports',  icon: BarChart3,  label: 'Analytics', color: 'analytics-blue' },
                    { to: '/hall-of-fame', icon: Trophy, label: 'Hall of Fame', color: 'amber-500' },
                ].map(({ to, icon: Icon, label, color }) => (
                    <motion.div key={to} variants={itemVariants} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                        <Link to={to} className="neo-card p-5 flex items-center gap-4 group hover:border-eco-green/50 transition-all">
                            <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted group-hover:bg-eco-green group-hover:text-white transition-all`}>
                                <Icon size={18} />
                            </div>
                            <h4 className="text-sm font-bold tracking-tight uppercase tracking-widest">{label}</h4>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Dashboard;
