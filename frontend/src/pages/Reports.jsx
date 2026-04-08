import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Activity, Leaf, TrendingDown, TrendingUp, Download,
    RefreshCw, Calendar, BarChart3, Lightbulb, Zap,
    Target, FileText, ArrowUpRight
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { downloadCSV, downloadPDF } from '../utils/exportUtils';

const COLORS = ['#2563EB', '#16A34A', '#059669', '#0284C7', '#10B981'];

const InsightCard = ({ title, value, unit, icon: Icon, color, description, trend }) => (
    <div className="neo-card p-5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: `${color}10`, color, borderColor: `${color}20` }}>
                <Icon size={16} />
            </div>
            {trend != null && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${trend > 0 ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-eco-green/10 text-eco-green'}`}>
                    {trend > 0 ? <ArrowUpRight size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="font-inter font-black text-xl tracking-tighter text-text-light dark:text-text-dark">{value}</h3>
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{unit}</span>
            </div>
            <p className="text-[9px] font-medium opacity-50 italic leading-tight">{description}</p>
        </div>
    </div>
);

const Reports = () => {
    const { token, user } = useAuth();
    const [loading,     setLoading]     = useState(true);
    const [fullHistory, setFullHistory] = useState([]);
    const [analytics,   setAnalytics]   = useState(null);
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [monthlyStats,setMonthlyStats]= useState(null);
    const [reportType,  setReportType]  = useState('Monthly');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [a, fullH, weekly, monthly] = await Promise.all([
                axios.get('http://localhost:5000/api/analytics/',      { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/emissions/history',{ headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/emissions/weekly-stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/emissions/monthly-stats',{ headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setAnalytics(a.data);
            setFullHistory(fullH.data.map(r => ({
                date: r.created_at?.substring(0, 10),
                footprint: r.total_co2,
                original: r,
            })).reverse());
            setWeeklyStats(weekly.data);
            setMonthlyStats(monthly.data);
        } catch (err) {
            console.error('Report fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    /* ── Derived values ── */
    const breakdown = analytics?.category_breakdown ?? {};
    const pieData   = [
        { name: 'Transport',   value: breakdown.transport  || 0 },
        { name: 'Energy',      value: breakdown.energy     || 0 },
        { name: 'Diet',        value: breakdown.diet       || 0 },
        { name: 'Waste',       value: breakdown.waste      || 0 },
    ].filter(d => d.value > 0);

    const calculateAvg = (days) => {
        if (!fullHistory.length) return 0;
        const past   = new Date(Date.now() - days * 86400000);
        const recent = fullHistory.filter(r => new Date(r.date) > past);
        if (!recent.length) return 0;
        return +(recent.reduce((a, r) => a + r.footprint, 0) / recent.length).toFixed(1);
    };

    const highestFootprint = fullHistory.length ? Math.max(...fullHistory.map(r => r.footprint)) : 0;
    const avgLoad30        = calculateAvg(30);
    const monthForecast    = +(avgLoad30 * 30).toFixed(0);
    const treesNeeded      = Math.ceil((monthForecast || 0) / 21);
    const score            = Math.max(0, Math.round(100 - avgLoad30 * 2));

    // Weekly comparison bar data
    const weeklyBarData = weeklyStats ? [
        { name: 'Last Week', co2: weeklyStats.last_week },
        { name: 'This Week', co2: weeklyStats.this_week },
    ] : [];
    const monthlyBarData = monthlyStats ? [
        { name: 'Last Month', co2: monthlyStats.last_month },
        { name: 'This Month', co2: monthlyStats.this_month },
    ] : [];

    /* ── PDF download ── */
    const handleDownloadPDF = () => {
        const now = new Date();
        let dateRange = '';
        if (reportType === 'Daily') {
            dateRange = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } else if (reportType === 'Weekly') {
            const wStart = new Date(now.getTime() - 7 * 86400000);
            dateRange = `${wStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        } else {
            dateRange = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        }

        downloadPDF({
            username:       user?.name || user?.username || 'EcoTrack User',
            dateRange,
            reportType,
            totalEmissions: reportType === 'Daily' ? avgLoad30 : reportType === 'Weekly' ? weeklyStats?.this_week ?? 0 : monthlyStats?.this_month ?? 0,
            breakdown: {
                transport:   breakdown.transport  || 0,
                electricity: breakdown.energy     || 0,
                gas:         0,
                waste:       breakdown.waste      || 0,
                diet:        breakdown.diet        || 0,
            },
            score,
            suggestions: [],
            treesNeeded,
        });
    };

    const handleDownloadCSV = () => {
        const reportData = fullHistory.map(item => ({
            Date:              item.date,
            'Footprint (kg)':  item.footprint,
            'Transport (km)':  item.original.transport_km,
            'Transport Type':  item.original.transport_type,
            'Vehicle Brand':   item.original.vehicle_brand,
            'Vehicle Model':   item.original.vehicle_model,
            'Vehicle Year':    item.original.vehicle_year,
            'Fuel Detail':     item.original.fuel_detail,
            'Driving Cond.':   item.original.driving_condition,
            'Actual Mileage':  item.original.actual_mileage,
            'Ref. Mileage':    item.original.ref_mileage,
            'Electricity kWh': item.original.electricity_kwh,
            'Gas Usage':       item.original.gas_usage,
            'Waste (kg)':      item.original.waste_kg,
            'Diet Type':       item.original.diet_type,
            'Family Size':     item.original.family_size,
            'Entry Mode':      item.original.entry_mode,
        }));
        downloadCSV(reportData, 'EcoTrack_Analytics_Detailed_Report.csv');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-eco-green animate-pulse">Syncing Analytics...</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6 pb-12">

            {/* Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm p-3 rounded-2xl border border-eco-border gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-analytics-blue/10 border border-analytics-blue/20">
                        <BarChart3 size={13} className="text-analytics-blue" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-analytics-blue">Analytics Intelligence</span>
                    </div>
                    {/* Report type selector */}
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {['Daily', 'Weekly', 'Monthly'].map(t => (
                            <button key={t} onClick={() => setReportType(t)}
                                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${reportType === t ? 'bg-white dark:bg-gray-700 text-text-light dark:text-text-dark shadow-sm' : 'text-text-muted'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-eco-green transition-all">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={handleDownloadCSV} className="flex-1 md:flex-none btn-neo-outline px-4 py-2 border-eco-border text-[9px] font-black uppercase tracking-widest">
                        <Download size={13} /> CSV
                    </button>
                    <button onClick={handleDownloadPDF} className="flex-1 md:flex-none btn-neo px-4 py-2 bg-analytics-blue text-white shadow-lg shadow-analytics-blue/20 text-[9px] font-black uppercase tracking-widest">
                        <FileText size={13} /> PDF Report
                    </button>
                </div>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <InsightCard title="Peak Emission"   value={highestFootprint.toFixed(1)} unit="kg" icon={Zap}        color="#2563EB" description="Highest recorded entry" trend={+12.4} />
                <InsightCard title="30-Day Avg"      value={avgLoad30}                   unit="kg" icon={Activity}   color="#16A34A" description="Typical daily footprint" />
                <InsightCard title="Monthly Forecast" value={monthForecast}              unit="kg" icon={Target}     color="#059669" description="Est. total for 30 days" />
                <InsightCard title="Trees to Offset" value={treesNeeded}                 unit=""   icon={Leaf}       color="#0284C7" description="Annual absorption = 21 kg" />
            </div>

            {/* Weekly / Monthly insight banners */}
            {(weeklyStats || monthlyStats) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weeklyStats && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${weeklyStats.improved ? 'bg-eco-green/5 border-eco-green/20' : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800/30'}`}>
                            {weeklyStats.improved
                                ? <TrendingDown size={16} className="text-eco-green shrink-0" />
                                : <TrendingUp size={16} className="text-red-500 shrink-0" />}
                            <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                                {weeklyStats.improved
                                    ? `You improved by ${Math.abs(weeklyStats.change_pct)}% this week vs last week. Outstanding!`
                                    : `Emissions increased by ${Math.abs(weeklyStats.change_pct)}% over last week. Consider reducing transport or electricity.`}
                            </p>
                        </div>
                    )}
                    {monthlyStats && (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${monthlyStats.improved ? 'bg-eco-green/5 border-eco-green/20' : 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/30'}`}>
                            {monthlyStats.improved
                                ? <TrendingDown size={16} className="text-eco-green shrink-0" />
                                : <TrendingUp size={16} className="text-amber-500 shrink-0" />}
                            <p className="text-[10px] font-medium text-text-muted leading-relaxed">
                                {monthlyStats.improved
                                    ? `Monthly emissions dropped by ${Math.abs(monthlyStats.change_pct)}% compared to last month.`
                                    : `Monthly emissions increased by ${Math.abs(monthlyStats.change_pct)}% this month.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trajectory area chart */}
                <div className="lg:col-span-2 neo-card p-5 md:p-8 space-y-5">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Emission Trajectory</h3>
                        <p className="text-[9px] text-text-muted mt-0.5">Historical performance & trends</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fullHistory}>
                                <defs>
                                    <linearGradient id="areaReport" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                <XAxis dataKey="date" tickFormatter={s => s?.substring(5,10)} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                <Area type="monotone" dataKey="footprint" name="CO₂ (kg)" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#areaReport)" />
                                {/* Average reference line approximated as a second data line with constant value */}
                                <Line type="monotone" dataKey={() => avgLoad30} name="30-day avg" stroke="#16A34A" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category breakdown pie */}
                <div className="neo-card p-5 md:p-8 flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Category Impact</h3>
                        <p className="text-[9px] text-text-muted mt-0.5">Contribution by sector</p>
                    </div>
                    {pieData.length > 0 ? (
                        <>
                            <div className="h-52 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {pieData.map((d, i) => {
                                    const total = pieData.reduce((a, x) => a + x.value, 0);
                                    const pct   = total > 0 ? Math.round(d.value / total * 100) : 0;
                                    return (
                                        <div key={d.name} className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{d.name}</span>
                                                </div>
                                                <span className="text-[9px] font-black">{pct}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i] }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-text-muted text-sm opacity-40">No breakdown data yet</div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 – Weekly & Monthly bar charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weeklyBarData.length > 0 && (
                    <div className="neo-card p-5 md:p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Weekly Comparison</h3>
                            <p className="text-[9px] text-text-muted mt-0.5">This week vs last week</p>
                        </div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyBarData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                    <Bar dataKey="co2" name="CO₂ (kg)" radius={[6, 6, 0, 0]}>
                                        {weeklyBarData.map((_, i) => <Cell key={i} fill={i === 1 ? '#16A34A' : '#2563EB'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                {monthlyBarData.length > 0 && (
                    <div className="neo-card p-5 md:p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Monthly Comparison</h3>
                            <p className="text-[9px] text-text-muted mt-0.5">This month vs last month</p>
                        </div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyBarData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
                                    <Bar dataKey="co2" name="CO₂ (kg)" radius={[6, 6, 0, 0]}>
                                        {monthlyBarData.map((_, i) => <Cell key={i} fill={i === 1 ? '#059669' : '#0284C7'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Reports;
