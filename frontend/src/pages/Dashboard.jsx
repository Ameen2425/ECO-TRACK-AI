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

    const handleExport = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/emissions/history', { headers: { Authorization: `Bearer ${token}` } });
            const exportData = res.data.map(item => ({
                Date:              new Date(item.created_at).toLocaleDateString(),
                'Transport (km)':  item.transport_km,
                'Transport Type':  item.transport_type,
                'Vehicle Brand':   item.vehicle_brand,
                'Vehicle Model':   item.vehicle_model,
                'Vehicle Year':    item.vehicle_year,
                'Fuel Detail':     item.fuel_detail,
                'Driving Cond.':   item.driving_condition,
                'Actual Mileage':  item.actual_mileage,
                'Ref. Mileage':    item.ref_mileage,
                'Electricity kWh': item.electricity_kwh,
                'Gas Usage':       item.gas_usage,
                'Waste (kg)':      item.waste_kg,
                'Diet Type':       item.diet_type,
                'Family Size':     item.family_size,
                'Total CO₂ (kg)':  item.total_co2,
            }));
            downloadCSV(exportData, 'EcoTrack_Premium_Export.csv');
        } catch { alert("Export failed."); }
    };

    useEffect(() => { fetchData(); }, [fetchData, location.key]);

    const latest       = data?.latest;
    const stats        = data?.stats;
    const intelligence = data?.intelligence;
    const weekly       = data?.weekly;
    const monthly      = data?.monthly;
    const co2          = latest?.footprint ?? 0;
    const score        = stats?.score ?? Math.max(0, Math.round(100 - (stats?.daily_avg ?? co2) * 2));
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-eco-green animate-pulse">Loading Dashboard...</p>
        </div>
    );

    if (!data || !latest) return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[500px] gap-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-eco-green/10 flex items-center justify-center border border-eco-green/20">
                <Leaf size={36} className="text-eco-green" />
            </div>
            <div className="space-y-2">
                <h3 className="font-black text-2xl tracking-tight text-text-light dark:text-text-dark">No data yet</h3>
                <p className="text-sm text-text-muted">Start tracking your carbon footprint by adding your first emission record.</p>
            </div>
            <Link to="/add-data" className="btn-neo px-8 py-3 shadow-lg shadow-eco-green/20">
                <PlusCircle size={16} /><span className="font-black uppercase tracking-widest text-[10px]">Add First Entry</span>
            </Link>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6 pb-12">

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl border border-eco-border gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-eco-green/10 border border-eco-green/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-eco-green">Live Analysis</span>
                    </div>
                    {profileType && (
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${PROFILE_COLORS[profileType] || 'text-text-muted bg-gray-100 border-eco-border'}`}>
                            {profileType}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-eco-border flex items-center justify-center text-text-muted hover:text-eco-green transition-all">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExport} className="flex-1 sm:flex-none btn-neo px-5 py-2 bg-eco-green text-white shadow-lg shadow-eco-green/20 text-[10px]">
                        <Download size={14} /> Export CSV
                    </button>
                    <Link to="/add-data" className="flex-1 sm:flex-none btn-neo px-5 py-2 shadow-lg text-[10px]">
                        <PlusCircle size={14} /> Add Entry
                    </Link>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Footprint"      value={co2.toFixed(1)}            unit="kg CO₂e"  icon={Leaf}         color="green" description="Latest entry" />
                <MetricCard label="Sustainability Score" value={score}                      unit="pts"      icon={Target}       color="green" description="Performance index" />
                <MetricCard label="Trees to Offset"      value={intelligence?.offset?.trees_to_offset ?? 0} unit="trees" icon={Globe} color="blue"  description="Annual offset needed" />
                <MetricCard label="Top Emission Source"  value={highestCat}                 unit=""         icon={Flame}        color="blue"  description="Highest impact category" />
            </div>

            {/* Weekly / Monthly summary */}
            {(weekly || monthly) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weekly && <MetricCard label="This Week" value={weekly.this_week.toFixed(1)} unit="kg" icon={Activity} color="green" trend={weekly.change_pct} description={weekly.improved ? 'Improved vs last week' : 'Increased vs last week'} />}
                    {weekly && <MetricCard label="Last Week"  value={weekly.last_week.toFixed(1)} unit="kg" icon={BarChart3} color="blue" description="Previous 7-day total" />}
                    {monthly && <MetricCard label="This Month" value={monthly.this_month.toFixed(1)} unit="kg" icon={TrendingDown} color="green" trend={monthly.change_pct} description={monthly.improved ? 'Improved vs last month' : 'Increased vs last month'} />}
                    {monthly && <MetricCard label="Last Month" value={monthly.last_month.toFixed(1)} unit="kg" icon={BarChart3} color="blue" description="Previous month total" />}
                </div>
            )}

            {/* Insights */}
            {(weekly || monthly) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekly && (
                        <InsightBanner
                            icon={weekly.improved ? TrendingDown : TrendingUp}
                            color={weekly.improved ? '#16A34A' : '#EF4444'}
                            text={weekly.improved
                                ? `You improved by ${Math.abs(weekly.change_pct)}% this week! Keep it up.`
                                : `Your emissions increased by ${Math.abs(weekly.change_pct)}% this week. Consider reducing ${highestCat} usage.`}
                        />
                    )}
                    <InsightBanner icon={Flame} color="#F59E0B" text={`${highestCat} contributes the most to your emissions. Focus here for maximum impact.`} />
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area chart */}
                <div className="lg:col-span-2 neo-card p-5 md:p-8 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Emission Trend</h3>
                            <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Historical CO₂ footprint</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-analytics-blue" />
                            <span className="text-[9px] font-bold opacity-50 uppercase">CO₂e</span>
                        </div>
                    </div>
                    <div className="h-56 sm:h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" hide />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                <Area type="monotone" dataKey="co2" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#areaBlue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie chart */}
                <div className="neo-card p-5 md:p-8 flex flex-col gap-5">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Source Breakdown</h3>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">By category</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={48} outerRadius={68} paddingAngle={6} dataKey="value" stroke="none">
                                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {pieData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted truncate">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Bar Chart */}
            {barData.length > 0 && (
                <div className="neo-card p-5 md:p-8 space-y-5">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Weekly Comparison</h3>
                        <p className="text-[9px] text-text-muted mt-0.5">This week vs. last week</p>
                    </div>
                    <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                <Bar dataKey="co2" name="CO₂ (kg)" radius={[6, 6, 0, 0]}>
                                    {barData.map((_, i) => <Cell key={i} fill={i === 1 ? '#16A34A' : '#2563EB'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Bottom insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Goal Progress */}
                <div className="neo-card p-5 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <Target size={16} className="text-eco-green" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-eco-green bg-eco-green/10 px-2 py-1 rounded-lg">Active</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight mb-1">Monthly Reduction</h4>
                        <p className="text-[9px] text-text-muted">Target: 20% decrease</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-eco-green w-[72%] shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
                        </div>
                        <span className="text-[9px] font-black text-text-muted block text-right uppercase tracking-widest">72% Completed</span>
                    </div>
                </div>

                {/* Score Ring */}
                <div className="neo-card p-5 flex flex-col items-center gap-4">
                    <h4 className="font-black text-xs uppercase tracking-widest opacity-40 self-start">Sustainability Score</h4>
                    <ScoreRing score={score} />
                    <div className="text-center">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                            {intelligence?.classification?.label ?? 'Calculating...'}
                        </p>
                    </div>
                </div>

                {/* AI Recommendation */}
                <div className="neo-card p-5 flex flex-col gap-4">
                    <div className="w-9 h-9 rounded-xl bg-analytics-blue/10 flex items-center justify-center text-analytics-blue border border-analytics-blue/20">
                        <Zap size={16} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">AI Recommendation</h4>
                        <p className="text-[9px] text-text-muted leading-relaxed mt-1">
                            {suggestions[0] || `Your ${highestCat} emissions are your highest source. Reducing it by 20% would save significant CO₂ this month.`}
                        </p>
                    </div>
                    <Link to="/tips" className="text-[9px] font-black text-analytics-blue uppercase tracking-widest hover:underline mt-auto">View All Tips →</Link>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { to: '/add-data', icon: PlusCircle, label: 'Add New Entry', sub: 'Log today\'s activities', color: 'eco-green' },
                    { to: '/reports',  icon: BarChart3,  label: 'Analytics',      sub: 'Deep insights & trends',  color: 'analytics-blue' },
                    { to: '/leaderboard', icon: Trophy,  label: 'Leaderboard',    sub: 'Compare with community',  color: 'amber-500' },
                ].map(({ to, icon: Icon, label, sub, color }) => (
                    <Link key={to} to={to} className={`neo-card p-5 flex items-center justify-between group hover:border-${color} active:scale-95 transition-all`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} group-hover:bg-${color} group-hover:text-white transition-all`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold tracking-tight">{label}</h4>
                                <p className="text-[9px] opacity-50">{sub}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
};

export default Dashboard;
