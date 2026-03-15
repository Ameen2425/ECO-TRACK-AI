import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    Activity, Leaf, TrendingDown, TrendingUp, Download,
    RefreshCw, Zap, Target, Globe, BarChart3, AlertCircle, Info, PlusCircle, Trophy
} from 'lucide-react';
import { downloadCSV } from '../utils/exportUtils';

// Inject print styles once (hides sidebar/topbar for PDF export)
const PRINT_STYLE_ID = 'eco-print-style';
if (!document.getElementById(PRINT_STYLE_ID)) {
    const s = document.createElement('style');
    s.id = PRINT_STYLE_ID;
    s.textContent = `
        @media print {
            .neo-sidebar, nav, header, .neo-topbar { display: none !important; }
            .neo-main { margin-left: 0 !important; padding: 0 !important; }
            body { background: #fff !important; color: #000 !important; }
        }
    `;
    document.head.appendChild(s);
}

// Score ring using SVG – color reflects score
const ScoreRing = ({ score }) => {
    const r = 58;
    const circ = 2 * Math.PI * r;
    const pct  = Math.min(100, Math.max(0, score));
    const isGood = pct >= 70;
    const color = isGood ? 'var(--eco-primary)' : pct >= 40 ? '#F59E0B' : '#EF4444';
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
            <svg className="w-full h-full -rotate-90 transform">
                <circle
                    cx="75" cy="75" r={r}
                    className="stroke-gray-100 dark:stroke-gray-800/40 fill-none"
                    strokeWidth="10"
                />
                <circle
                    cx="75" cy="75" r={r}
                    className="fill-none transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
                <span className="font-inter font-black text-4xl tracking-tighter" style={{ color }}>{pct}</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Score</span>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, unit, icon: Icon, trend, color, description }) => (
    <div className="neo-card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${color === 'green' ? 'bg-eco-green/10 border-eco-green/20 text-eco-green' : 'bg-analytics-blue/10 border-analytics-blue/20 text-analytics-blue'}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend > 0 ? 'bg-red-50 text-red-500' : 'bg-eco-green/10 text-eco-green'}`}>
                    {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="font-inter font-black text-3xl tracking-tighter text-text-light dark:text-text-dark">{value}</h3>
                <span className="text-xs font-bold opacity-40 uppercase tracking-widest">{unit}</span>
            </div>
            {description && <p className="text-[10px] font-medium opacity-60 italic">{description}</p>}
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

    const handleExport = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/emissions/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const exportData = res.data.map(item => ({
                Date: new Date(item.created_at).toLocaleDateString(),
                Time: new Date(item.created_at).toLocaleTimeString(),
                'Transport (KM)': item.transport_km,
                'Transport Type': item.transport_type,
                'Electricity (kWh)': item.electricity_kwh,
                'Diet Type': item.diet_type,
                'Gas Usage': item.gas_usage,
                'Waste (KG)': item.waste_kg,
                'Total CO2 (KG)': item.total_co2
            }));
            downloadCSV(exportData, 'EcoTrack_Data_Export.csv');
        } catch (error) {
            alert("Export failed. Please try again.");
            console.error(error);
        }
    };

    useEffect(() => { fetchData(); }, [fetchData, location.key]);

    const latest        = data?.latest;
    const stats         = data?.stats;
    const intelligence  = data?.intelligence;
    const classification = intelligence?.classification;

    const co2        = latest?.footprint ?? 0;
    const score      = stats?.daily_avg != null
                        ? Math.max(0, Math.round(100 - stats.daily_avg * 2))
                        : co2 > 0 ? Math.max(0, Math.round(100 - co2 * 2)) : 0;
    const history    = (data?.history ?? []).map(h => ({ date: h.date?.substring(0,10), co2: h.footprint })).reverse();

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
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 pb-12"
        >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-2xl border border-eco-border gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-eco-green/10 border border-eco-green/20">
                        <div className="w-2 h-2 rounded-full bg-eco-green animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-eco-green">Live Analysis</span>
                    </div>
                    <span className="hidden xs:inline text-text-muted text-xs font-medium italic">Last updated {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={fetchData}
                        className="w-10 h-10 rounded-xl bg-background-light dark:bg-background-dark border border-eco-border flex items-center justify-center text-text-muted hover:text-eco-green hover:border-eco-green transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex-1 sm:flex-none btn-neo px-6 bg-eco-green hover:bg-eco-green/90 text-white shadow-lg shadow-eco-green/20"
                    >
                        <Download size={16} /> Export Data
                    </button>
                </div>
            </div>

            {/* Top Metrics Row - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Total Footprint"
                    value={latest?.footprint?.toFixed(1) || '0.0'}
                    unit="KG CO₂E"
                    icon={Leaf}
                    color="green"
                    trend={-14}
                    description="Total emissions this period"
                />
                <MetricCard
                    label="Sustainability Score"
                    value={score}
                    unit="PTS"
                    icon={Target}
                    color="green"
                    description="Performance ranking index"
                />
                <MetricCard
                    label="Emission Trend"
                    value="2.4"
                    unit="%"
                    icon={TrendingDown}
                    trend={-2.4}
                    color="blue"
                    description="Trajectory vs last week"
                />
                <MetricCard
                    label="Carbon Offset"
                    value={intelligence?.offset?.trees_to_offset || '0'}
                    unit="Trees"
                    icon={Globe}
                    color="blue"
                    description="Required offset unit"
                />
            </div>

            {/* Middle Row - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart 1: Trend Line (66%) */}
                <div className="lg:col-span-2 neo-card p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-light dark:text-text-dark">Emission Analytics</h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest">Historical trace magnitude</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-analytics-blue" />
                                <span className="text-[9px] font-bold uppercase opacity-50">Impact</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 sm:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                <Area type="monotone" dataKey="co2" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Category Breakdown (33%) */}
                <div className="neo-card p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-light dark:text-text-dark">Source breakdown</h3>
                    <div className="flex-1 flex flex-col justify-center items-center gap-8">
                        <div className="h-44 sm:h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={8} dataKey="value" stroke="none">
                                        {pieData.map((_, i) => <Cell key={i} fill={['#2563EB', '#16A34A', '#3B82F6', '#22C55E'][i % 4]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
                            {pieData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ['#2563EB', '#16A34A', '#3B82F6', '#22C55E'][i % 4] }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted truncate">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Goal Tracking */}
                <div className="neo-card p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <Target size={18} className="text-eco-green" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-eco-green bg-eco-green/10 px-2 py-1 rounded-lg">Target Active</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight mb-1">Monthly Reduction</h4>
                        <p className="text-[10px] text-text-muted">Target: 20% Decrease</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-eco-green w-[72%] shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
                        </div>
                        <span className="text-[9px] font-black text-text-muted block text-right uppercase tracking-widest">72% Completed</span>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="neo-card p-6 flex flex-col gap-4">
                    <div className="w-8 h-8 rounded-lg bg-analytics-blue/10 flex items-center justify-center text-analytics-blue">
                        <Zap size={16} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm tracking-tight">AI Optimization</h4>
                        <p className="text-[10px] text-text-muted leading-relaxed">Switching to a plant-based diet for 3 days a week could reduce your footprint by <span className="text-eco-green font-bold">1.2kg CO₂</span>.</p>
                    </div>
                    <Link to="/tips" className="text-[9px] font-black text-analytics-blue uppercase tracking-widest hover:underline mt-auto">View full report</Link>
                </div>

                {/* Emission Comparison */}
                <div className="neo-card p-6 flex flex-col gap-4">
                    <div className="w-8 h-8 rounded-lg bg-eco-green/10 flex items-center justify-center text-eco-green">
                        <Activity size={16} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm tracking-tight">Global Standing</h4>
                        <p className="text-[10px] text-text-muted leading-relaxed">Your footprint is <span className="text-eco-green font-black">24% lower</span> than the country average. Outstanding work!</p>
                    </div>
                    <Link to="/leaderboard" className="text-[9px] font-black text-eco-green uppercase tracking-widest hover:underline mt-auto">Open leaderboard</Link>
                </div>
            </div>

            {/* Quick Navigation Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/add-data" className="neo-card p-6 flex items-center justify-between group hover:border-eco-green active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green group-hover:bg-eco-green group-hover:text-white transition-all shadow-sm">
                            <PlusCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight">Add New Data</h4>
                            <p className="text-[10px] opacity-50">Log today's activities</p>
                        </div>
                    </div>
                </Link>
                <Link to="/reports" className="neo-card p-6 flex items-center justify-between group hover:border-analytics-blue active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-analytics-blue/10 flex items-center justify-center text-analytics-blue group-hover:bg-analytics-blue group-hover:text-white transition-all shadow-sm">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight">Detailed Analytics</h4>
                            <p className="text-[10px] opacity-50">View deep insights</p>
                        </div>
                    </div>
                </Link>
                <Link to="/leaderboard" className="neo-card p-6 flex items-center justify-between group hover:border-amber-500 active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight">Eco Standings</h4>
                            <p className="text-[10px] opacity-50">Check community rank</p>
                        </div>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
};

export default Dashboard;
