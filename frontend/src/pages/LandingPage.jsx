import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Activity, Leaf, TrendingDown, Target, Zap, 
    ArrowRight, Globe, Shield, BarChart3, Users 
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const DEMO_DATA = [
    { date: 'Mon', co2: 45 },
    { date: 'Tue', co2: 38 },
    { date: 'Wed', co2: 52 },
    { date: 'Thu', co2: 30 },
    { date: 'Fri', co2: 25 },
    { date: 'Sat', co2: 28 },
    { date: 'Sun', co2: 20 },
];

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="neo-card p-6 flex flex-col gap-4 group transition-all duration-300"
    >
        <div className="w-12 h-12 rounded-xl bg-primary-light/10 flex items-center justify-center text-primary-light border border-primary-light/20">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-inter font-bold text-lg mb-2">{title}</h3>
            <p className="neo-label leading-relaxed">{desc}</p>
        </div>
    </motion.div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-inter selection:bg-primary-light/30 overflow-x-hidden">
            
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-eco-border z-50 px-6 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shadow-lg shadow-primary-light/20">
                        <Leaf className="text-white" size={20} />
                    </div>
                    <span className="font-orbitron font-black text-xl tracking-tighter uppercase italic">
                        Eco<span className="text-primary-light">Track</span> AI
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="btn-neo-ghost hidden sm:inline-flex">Log In</Link>
                    <Link to="/register" className="btn-neo shadow-lg shadow-primary-light/20">Get Started</Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-32">
                
                {/* Hero Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light/10 text-primary-light border border-primary-light/20 text-xs font-bold uppercase tracking-widest">
                            <Zap size={14} className="animate-pulse" />
                            AI-Powered Sustainability
                        </div>
                        <h1 className="text-5xl md:text-7xl font-inter font-black tracking-tighter leading-[1.1]">
                            Track Your <span className="text-primary-light italic">Carbon</span> Journey In Real-Time
                        </h1>
                        <p className="text-lg text-text-muted max-w-lg leading-relaxed">
                            Join over 10,000+ eco-conscious individuals using AI to analyze, 
                            reduce, and offset their carbon footprint with surgical precision.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/register" className="btn-neo px-8 py-4 text-base group">
                                Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="btn-neo-outline px-8 py-4 text-base">
                                View Demo Trace
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Mock Dashboard Preview */}
                        <div className="neo-card-glow p-6 md:p-8 backdrop-blur-xl bg-background-light/40 dark:bg-background-dark/40 border border-eco-border shadow-premium skew-y-1 hover:skew-y-0 transition-all duration-500 scale-95 hover:scale-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="neo-heading text-sm font-bold opacity-80 uppercase tracking-widest">Live Demo Trace</h3>
                                    <p className="neo-label">User: EcoExplorer_01</p>
                                </div>
                                <div className="badge-blue !bg-analytics-blue/10 !text-analytics-blue !border-analytics-blue/20">Active Analysis</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-eco-border shadow-sm">
                                    <p className="neo-label text-[10px]">CURRENT IMPACT</p>
                                    <div className="text-2xl font-black text-analytics-blue">12.5 kg</div>
                                </div>
                                <div className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-eco-border shadow-sm">
                                    <p className="neo-label text-[10px]">DAILY REDUCTION</p>
                                    <div className="text-2xl font-black text-eco-green">-14%</div>
                                </div>
                            </div>

                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={DEMO_DATA}>
                                        <defs>
                                            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563EB" />
                                                <stop offset="100%" stopColor="#60A5FA" />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                background: 'var(--bg-card)', 
                                                border: '1px solid var(--border)',
                                                borderRadius: 12,
                                                fontSize: '10px'
                                            }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="co2" 
                                            stroke="url(#heroGradient)" 
                                            strokeWidth={4} 
                                            dot={{ fill: '#2563EB', r: 4 }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Floating elements for "depth" */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-analytics-blue rounded-full blur-[80px] opacity-20 animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-eco-green rounded-full blur-[100px] opacity-10 animate-pulse" />
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-inter font-black tracking-tight">Powerful AI Insights</h2>
                        <p className="neo-label max-w-2xl mx-auto text-base">Everything you need to master your environmental impact and lead the transition to a greener future.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard 
                            icon={BarChart3} 
                            title="Deep Analytics" 
                            desc="Break down your emissions by transport, diet, energy and more with interactive visualizations." 
                        />
                        <FeatureCard 
                            icon={Globe} 
                            title="Global Benchmarks" 
                            desc="Compare your progress against country averages and community leaders worldwide." 
                        />
                        <FeatureCard 
                            icon={Shield} 
                            title="Data Privacy" 
                            desc="Your personal activity data is encrypted and remains under your full control at all times." 
                        />
                        <FeatureCard 
                            icon={Users} 
                            title="Eco Community" 
                            desc="Join groups, share tips, and compete in friendly leaderboard challenges for the top spot." 
                        />
                    </div>
                </section>

                {/* Demo Trace Call to Action */}
                <section className="neo-card p-8 md:p-12 relative overflow-hidden bg-primary-light text-white border-none text-center space-y-8">
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-4xl font-black tracking-tight">Ready to see your impact?</h2>
                        <p className="opacity-80 max-w-xl mx-auto text-lg italic">"The greatest threat to our planet is the belief that someone else will save it."</p>
                        <div className="pt-4 flex flex-wrap justify-center gap-4">
                            <Link to="/register" className="bg-white text-primary-light hover:bg-white/90 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105">
                                Create Account
                            </Link>
                            <Link to="/login" className="bg-primary-light border-2 border-white/30 hover:border-white/60 px-8 py-4 rounded-xl font-bold transition-all">
                                Access Member Area
                            </Link>
                        </div>
                    </div>
                    <Activity size={300} className="absolute -bottom-20 -right-20 opacity-10 rotate-12" />
                    <Leaf size={300} className="absolute -top-20 -left-20 opacity-10 -rotate-12" />
                </section>

            </main>

            <footer className="border-t border-eco-border py-12 px-6 md:px-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                    <Leaf size={16} />
                    <span className="font-orbitron font-black text-sm uppercase italic">EcoTrack AI</span>
                </div>
                <p className="neo-label text-xs opacity-40">© 2026 AI-Powered Sustainability Project. For a Better Tomorrow.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
