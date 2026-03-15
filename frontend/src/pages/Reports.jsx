import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    Activity, Leaf, TrendingDown, TrendingUp, Download, 
    RefreshCw, Filter, Calendar, BarChart3, PieChart as PieIcon, 
    LineChart as LineIcon, AlertCircle, Info, Lightbulb, Zap, ArrowUpRight, Target, Globe
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { downloadCSV } from '../utils/exportUtils';

const COLORS = ['#2563EB', '#16A34A', '#3B82F6', '#22C55E', '#F59E0B'];

const InsightCard = ({ title, value, unit, icon: Icon, color, description, trend }) => (
    <div className="neo-card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${color}10`, color: color }}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${trend > 0 ? 'bg-red-50 text-red-500' : 'bg-eco-green/10 text-eco-green'}`}>
                    {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="font-inter font-black text-2xl tracking-tighter text-text-light dark:text-text-dark">{value}</h3>
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{unit}</span>
            </div>
            <p className="text-[9px] font-medium opacity-50 italic leading-tight">{description}</p>
        </div>
    </div>
);

const Reports = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fullHistory, setFullHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [a, fullH] = await Promise.all([
                axios.get('http://localhost:5000/api/analytics/', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/emissions/history', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setAnalytics(a.data);
            setFullHistory(fullH.data.map(r => ({ 
                date: r.created_at?.substring(0, 10), 
                footprint: r.total_co2,
                original: r 
            })).reverse());
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        const reportData = fullHistory.map(item => ({
            Date: item.date,
            'Footprint (KG)': item.footprint,
            'Category Breakdown': item.original.transport_km > 0 ? `Transport: ${item.original.transport_type} (${item.original.transport_km}km)` : 'N/A'
        }));
        downloadCSV(reportData, 'EcoTrack_Analytics_Report.csv');
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const breakdown = analytics?.category_breakdown ?? {};
    const pieData = [
        { name: 'Transport', value: breakdown.transport || 0 },
        { name: 'Energy', value: breakdown.energy || 0 },
        { name: 'Diet', value: breakdown.diet || 0 },
        { name: 'Waste', value: breakdown.waste || 0 },
    ].filter(d => d.value > 0);

    const calculateAvg = (days) => {
        if (fullHistory.length === 0) return 0;
        const now = new Date();
        const past = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        const recent = fullHistory.filter(r => new Date(r.date) > past);
        if (recent.length === 0) return 0;
        return (recent.reduce((acc, r) => acc + r.footprint, 0) / recent.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-eco-green animate-pulse">Synchronizing Analytics...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 pb-12"
        >
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 rounded-3xl border border-eco-border gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-analytics-blue/10 border border-analytics-blue/20">
                        <BarChart3 className="text-analytics-blue" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-analytics-blue">Analytics Intelligence</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-eco-border transition-all text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <Calendar size={14} />
                        Past 30 Days
                    </button>
                    <button onClick={fetchData} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-eco-border flex items-center justify-center text-text-muted transition-all">
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleDownloadReport}
                        className="flex-1 md:flex-none btn-neo bg-analytics-blue text-white shadow-lg shadow-analytics-blue/10"
                    >
                        <Download size={14} /> Reports
                    </button>
                </div>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InsightCard 
                    title="Highest Peak" 
                    value={fullHistory.length > 0 ? Math.max(...fullHistory.map(r => r.footprint)).toFixed(1) : '0.0'} 
                    unit="KG" 
                    icon={Zap} 
                    color="#2563EB" 
                    description="Highest recorded emission in this period"
                    trend={+12.4}
                />
                <InsightCard 
                    title="Average Load" 
                    value={calculateAvg(30)} 
                    unit="KG" 
                    icon={Activity} 
                    color="#16A34A" 
                    description="Your typical daily footprint weight"
                />
                <InsightCard 
                    title="Optimization" 
                    value="Low" 
                    unit="Impact" 
                    icon={Lightbulb} 
                    color="#F59E0B" 
                    description="Potential savings identified in Transport"
                />
                <InsightCard 
                    title="Monthly Forecast" 
                    value={(calculateAvg(30) * 30).toFixed(0)} 
                    unit="KG" 
                    icon={Target} 
                    color="#3B82F6" 
                    description="Estimated total for the next 30 days"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detailed Trend */}
                <div className="lg:col-span-2 neo-card p-6 lg:p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                        <LineIcon size={240} />
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-sm font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">Emission Trajectory</h3>
                            <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Historical performance & trends</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fullHistory}>
                                <defs>
                                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(str) => str?.substring(5,10)}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }}
                                />
                                <Area type="monotone" dataKey="footprint" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories */}
                <div className="neo-card p-8 shadow-sm flex flex-col gap-10">
                    <div className="space-y-1">
                        <h3 className="text-sm font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">Category Impact</h3>
                        <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Contribution by sector</p>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    innerRadius={70} 
                                    outerRadius={95} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {pieData.map((d, i) => (
                            <div key={d.name} className="flex flex-col gap-2 group">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <div className="flex items-center gap-2 text-text-muted group-hover:text-text-light dark:group-hover:text-text-dark transition-colors">
                                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                                        {d.name}
                                    </div>
                                    <span className="text-text-light dark:text-text-dark">{d.value.toFixed(1)} kg</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000" 
                                        style={{ width: `${(d.value / Math.max(...pieData.map(p => p.value)) * 100)}%`, background: COLORS[i % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
