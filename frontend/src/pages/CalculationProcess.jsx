import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, CheckCircle, Calculator, TrendingDown, BarChart2 } from 'lucide-react';

const steps = [
    { name: 'Transport Emissions',  key: 'transport' },
    { name: 'Energy Consumption',   key: 'energy' },
    { name: 'Dietary Impact',       key: 'diet' },
    { name: 'Heating / Gas',        key: 'heating' },
    { name: 'Waste Disposal',       key: 'waste' },
];

const CalculationProcess = () => {
    const [step, setStep] = useState(0);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const run = async () => {
            const data = JSON.parse(localStorage.getItem('pendingEmission'));
            if (!data) return navigate('/add-data');

            for (let i = 0; i <= steps.length; i++) {
                setStep(i);
                await new Promise(r => setTimeout(r, 1100));
            }

            try {
                const res = await axios.post('http://localhost:5000/api/emissions/add', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResult(res.data);
                localStorage.removeItem('pendingEmission');
            } catch (err) {
                console.error(err);
            }
        };
        run();
    }, []);

    return (
        <div className="max-w-2xl mx-auto py-8">
            <AnimatePresence mode="wait">
                {step < steps.length ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="neo-card p-10 text-center space-y-8"
                    >
                        {/* Spinner */}
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-2 border-neo-border rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-neo-green rounded-full border-t-transparent animate-spin"></div>
                            <Calculator className="absolute inset-0 m-auto text-neo-green" size={28} />
                        </div>

                        <div>
                            <p className="neo-label mb-2">Eco-Intelligence Processing</p>
                            <h2 className="font-orbitron text-2xl font-bold text-neo-text uppercase">Analyzing Data...</h2>
                            <p className="text-neo-text-muted mt-2 font-rajdhani">
                                Calculating:{' '}
                                <span className="text-neo-green font-semibold uppercase tracking-wider">
                                    {steps[step]?.name}
                                </span>
                            </p>
                        </div>

                        {/* Step progress */}
                        <div className="space-y-2 text-left">
                            {steps.slice(0, step + 1).map((s, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-neo-card border border-neo-border"
                                >
                                    <span className="text-neo-text-muted font-rajdhani uppercase tracking-wide text-sm">{s.name}</span>
                                    <CheckCircle size={16} className="text-neo-green" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.6))' }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : result ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="neo-card p-10 text-center space-y-8"
                    >
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto rounded-full bg-neo-green/10 border border-neo-green/30 flex items-center justify-center"
                            style={{ boxShadow: '0 0 20px rgba(0,255,136,0.2)' }}>
                            <Leaf className="text-neo-green w-10 h-10" />
                        </div>

                        <div>
                            <p className="neo-label mb-2">Analysis Complete</p>
                            <h2 className="font-orbitron text-2xl font-bold text-neo-text uppercase">Emission Report</h2>
                        </div>

                        {/* Big number */}
                        <div>
                            <div className="flex items-baseline justify-center gap-3">
                                <span className="font-orbitron font-black text-7xl text-neo-green text-glow">
                                    {result.total_co2.toFixed(2)}
                                </span>
                                <span className="text-neo-text-muted font-rajdhani uppercase tracking-widest text-xl">KG CO₂E</span>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="neo-card p-4 text-left">
                                <p className="neo-label mb-1">Tree Equivalent</p>
                                <div className="flex items-center gap-2">
                                    <Leaf size={18} className="text-neo-green" />
                                    <span className="font-orbitron font-bold text-2xl text-neo-text">
                                        {result.trees_needed}
                                    </span>
                                </div>
                                <p className="neo-label mt-1">Trees Needed</p>
                            </div>
                            <div className="neo-card p-4 text-left">
                                <p className="neo-label mb-1">Trend Analysis</p>
                                <div className="flex items-center gap-2">
                                    <TrendingDown size={18} className="text-neo-green" />
                                    <span className="font-orbitron font-bold text-2xl text-neo-green">Stable</span>
                                </div>
                                <p className="neo-label mt-1">On Track</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-neo w-full justify-center py-3 text-base"
                        >
                            <BarChart2 size={18} />
                            View Full Analytics
                        </button>
                    </motion.div>
                ) : (
                    <div className="neo-card p-12 text-center">
                        <p className="text-neo-green font-orbitron animate-pulse">Connecting to AI Engine...</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalculationProcess;
