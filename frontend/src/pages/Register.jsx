import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Mail, AlertCircle } from 'lucide-react';

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/register', form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-neo-green/10 border border-neo-green/40 flex items-center justify-center"
                        style={{ boxShadow: '0 0 20px rgba(0,255,136,0.15)' }}>
                        <span className="font-orbitron font-bold text-neo-green text-2xl">E</span>
                    </div>
                    <div className="text-left">
                        <div className="font-orbitron font-bold text-neo-text text-lg tracking-widest">ECOTRACKER</div>
                        <div className="text-neo-text-muted text-xs font-rajdhani tracking-[0.3em] uppercase">Neon-AI System</div>
                    </div>
                </div>
                <h1 className="font-orbitron text-2xl font-bold text-neo-text uppercase tracking-widest mt-2">Register Node</h1>
                <p className="neo-label mt-1">Create your eco-intelligence profile</p>
            </div>

            <div className="neo-card p-8 space-y-6" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                {error && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-rajdhani">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="neo-label block mb-2">Username</label>
                        <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neo-text-muted" />
                            <input type="text" placeholder="Choose username..." value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="pl-11" required />
                        </div>
                    </div>
                    <div>
                        <label className="neo-label block mb-2">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neo-text-muted" />
                            <input type="email" placeholder="Enter email..." value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="pl-11" required />
                        </div>
                    </div>
                    <div>
                        <label className="neo-label block mb-2">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neo-text-muted" />
                            <input type="password" placeholder="Create password..." value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="pl-11" required />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-neo w-full justify-center py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Initialize Profile'}
                    </button>
                </form>

                <p className="text-center text-neo-text-muted text-sm font-rajdhani">
                    Already registered?{' '}
                    <Link to="/login" className="text-neo-green hover:underline font-semibold uppercase tracking-wide">
                        System Access
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
