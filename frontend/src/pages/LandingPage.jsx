import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Activity, Leaf, TrendingDown, Target, Zap, 
    ArrowRight, Globe, Shield, BarChart3, Users,
    Sparkles, CheckCircle, Wind
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_DATA = [
    { date: 'Mon', co2: 45 },
    { date: 'Tue', co2: 38 },
    { date: 'Wed', co2: 52 },
    { date: 'Thu', co2: 30 },
    { date: 'Fri', co2: 25 },
    { date: 'Sat', co2: 28 },
    { date: 'Sun', co2: 20 },
];

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        className="neo-card p-8 flex flex-col gap-5 group transition-all duration-500 hover:shadow-2xl hover:shadow-eco-green/5 border-t-4"
        style={{ borderTopColor: color }}
    >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12 duration-500"
            style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}>
            <Icon size={28} />
        </div>
        <div className="space-y-2">
            <h3 className="font-black text-lg tracking-tight uppercase">{title}</h3>
            <p className="text-xs text-text-muted leading-relaxed font-medium">{desc}</p>
        </div>
        <div className="mt-auto pt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-eco-green opacity-0 group-hover:opacity-100 transition-opacity">
            Discover Tech <ArrowRight size={12} />
        </div>
    </motion.div>
);

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-inter selection:bg-eco-green/30 overflow-x-hidden transition-colors duration-700 relative">
            
            {/* Premium Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
                />
                
                {/* Technical Grid */}
                <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Floating Animated Blobs */}
                <motion.div 
                    animate={{ 
                        x: [0, 40, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-eco-green/10 dark:bg-eco-green/5 rounded-full blur-[120px]" 
                />
                <motion.div 
                    animate={{ 
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-analytics-blue/10 dark:bg-analytics-blue/5 rounded-full blur-[120px]" 
                />
            </div>

            {/* Nav */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 h-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-eco-border z-50 px-6 md:px-12 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <motion.div 
                        whileHover={{ rotate: 15 }}
                        className="w-11 h-11 rounded-2xl bg-eco-green flex items-center justify-center shadow-xl shadow-eco-green/20 rotate-3"
                    >
                        <Leaf className="text-white" size={22} />
                    </motion.div>
                    <span className="font-black text-2xl tracking-tighter uppercase italic leading-none">
                        Eco<span className="text-eco-green">Track</span> <span className="text-[10px] block font-black uppercase tracking-[0.4em] opacity-40">Intelligence</span>
                    </span>
                </div>
                <div className="flex items-center gap-5">
                    <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-eco-green transition-colors hidden sm:block">Log In</Link>
                    <Link to="/register" className="btn-neo px-6 py-2.5 shadow-xl shadow-eco-green/10 text-[11px]">Get Started</Link>
                </div>
            </motion.nav>

            <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-32">
                
                {/* Hero */}
                <motion.section 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                >
                    <div className="space-y-10">
                        <motion.div 
                            variants={itemVariants}
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-eco-green/10 text-eco-green border border-eco-green/20 text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                            <Sparkles size={14} className="animate-pulse" />
                            Eco AI Engine v2.4 Active
                        </motion.div>
                        <motion.h1 
                            variants={itemVariants}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-text-light dark:text-text-dark"
                        >
                            Track Your <span className="text-eco-green italic decoration-eco-green/30 underline decoration-8">Carbon</span> Impact
                        </motion.h1>
                        <motion.p 
                            variants={itemVariants}
                            className="text-lg text-text-muted max-w-lg leading-relaxed font-medium"
                        >
                            Join 10,000+ sustainability heroes using high-fidelity AI analytics to measure, 
                            reduce, and offset their carbon trajectory with surgical precision.
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
                            <Link to="/register" className="btn-neo px-10 py-5 text-[11px] group shadow-2xl shadow-eco-green/20 uppercase tracking-widest font-black">
                                Start Free Trace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                            </Link>
                            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border">
                                <div className="flex -space-x-3">
                                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-eco-green flex items-center justify-center text-[10px] font-black text-white">U{i}</div>)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">+12k Active</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        variants={itemVariants}
                        className="relative"
                    >
                        {/* Premium Preview */}
                        <motion.div 
                            whileHover={{ y: -10, rotate: 1 }}
                            className="neo-card-glow p-8 md:p-12 backdrop-blur-3xl bg-white/40 dark:bg-gray-950/40 border-2 border-white/20 dark:border-white/5 shadow-[0_40px_100px_-20px_rgba(22,163,74,0.15)] relative z-10 group"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">Intelligence Node</h3>
                                    <p className="text-sm font-black uppercase tracking-widest">Real-time Analysis</p>
                                </div>
                                <div className="px-3 py-1.5 rounded-xl bg-analytics-blue/10 text-analytics-blue border border-analytics-blue/20 text-[9px] font-black uppercase tracking-widest animate-pulse">Syncing...</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 border border-eco-border shadow-inner transition-transform group-hover:translate-y-[-4px]">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Footprint</p>
                                    <div className="text-3xl font-black text-analytics-blue tracking-tighter">12.5 <span className="text-[10px] opacity-40 font-bold uppercase">kg</span></div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 border border-eco-border shadow-inner transition-transform group-hover:translate-y-[-4px] delay-75">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Efficiency</p>
                                    <div className="text-3xl font-black text-eco-green tracking-tighter">+82 <span className="text-[10px] opacity-40 font-bold uppercase">pts</span></div>
                                </div>
                            </div>

                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={DEMO_DATA}>
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                background: 'rgba(255,255,255,0.8)', 
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 12,
                                                fontSize: '10px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="co2" 
                                            stroke="#16A34A" 
                                            strokeWidth={4} 
                                            fill="url(#areaGrad)"
                                            dot={{ fill: '#16A34A', r: 5, strokeWidth: 2, stroke: '#fff' }} 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Floating depth */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                x: [0, 20, 0],
                                y: [0, -20, 0]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -right-12 w-48 h-48 bg-analytics-blue rounded-full blur-[100px] opacity-20" 
                        />
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.3, 1],
                                x: [0, -20, 0],
                                y: [0, 20, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-20 -left-20 w-64 h-64 bg-eco-green rounded-full blur-[120px] opacity-15" 
                        />
                    </motion.div>
                </motion.section>

                {/* Features */}
                <motion.section 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-20"
                >
                    <div className="text-center space-y-4">
                        <motion.div variants={itemVariants} className="inline-block px-4 py-2 rounded-full bg-eco-green/5 border border-eco-green/10 text-[10px] font-black uppercase tracking-widest text-eco-green mb-2">Capabilities</motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tighter uppercase">High Fidelity Intelligence</motion.h2>
                        <motion.p variants={itemVariants} className="text-text-muted max-w-2xl mx-auto text-base font-medium">Engineered for precision. Built for impact. Join the elite community of climate conscious leaders.</motion.p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <motion.div variants={itemVariants}><FeatureCard icon={BarChart3} color="#16A34A" title="Analytics" desc="Deep neural breakdown of emissions by transport, energy, and diet with surgical precision." /></motion.div>
                        <motion.div variants={itemVariants}><FeatureCard icon={Globe} color="#2563EB" title="Global Scale" desc="Benchmark your trajectory against global averages and competitive eco leaderboards." /></motion.div>
                        <motion.div variants={itemVariants}><FeatureCard icon={Shield} color="#059669" title="Privacy OS" desc="Your personal activity clusters are encrypted and remain under your absolute control." /></motion.div>
                        <motion.div variants={itemVariants}><FeatureCard icon={Wind} color="#0284C7" title="Offset Hub" desc="Direct integration with validated environmental projects to achieve carbon equilibrium." /></motion.div>
                    </div>
                </motion.section>

                {/* Big CTA */}
                <motion.section 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="neo-card p-12 md:p-24 relative overflow-hidden bg-eco-green text-white border-none text-center space-y-10 group shadow-[0_50px_100px_-20px_rgba(22,163,74,0.3)]"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]"
                        >
                            Ready to Synchronize?
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="opacity-80 max-w-2xl mx-auto text-lg font-medium italic underline decoration-white/20 underline-offset-8"
                        >
                            "The transition to a sustainable future is not an option, it is a technical necessity."
                        </motion.p>
                        <div className="pt-8 flex flex-wrap justify-center gap-6">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/register" className="bg-white text-eco-green hover:bg-gray-50 px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all block">
                                    Initialize Account
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/login" className="bg-eco-green border-2 border-white/40 hover:border-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all block">
                                    Member Access
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-40 -right-40 opacity-10 pointer-events-none"
                    >
                        <Activity size={400} />
                    </motion.div>
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-40 -left-40 opacity-10 pointer-events-none"
                    >
                        <Target size={400} />
                    </motion.div>
                </motion.section>

            </main>

            <footer className="border-t border-eco-border py-16 px-6 md:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-eco-green flex items-center justify-center shadow-lg shadow-eco-green/10">
                            <Leaf className="text-white" size={18} />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase italic">EcoTrack AI</span>
                    </div>
                    <div className="flex gap-8">
                        {['Privacy', 'Technical Intelligence', 'Global Hub', 'Status'].map(link => (
                            <button key={link} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-eco-green transition-colors">{link}</button>
                        ))}
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-eco-border/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 text-text-muted">© 2026 EcoTrack Intelligence Systems · NextGen Sustainability</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
