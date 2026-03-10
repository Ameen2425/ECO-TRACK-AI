import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', form);
            login(res.data.access_token, form.username);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo */}
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
                <h1 className="font-orbitron text-2xl font-bold text-neo-text uppercase tracking-widest mt-2">System Access</h1>
                <p className="neo-label mt-1">Enter credentials to authenticate</p>
            </div>

            {/* Card */}
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
                            <input
                                type="text"
                                placeholder="Enter username..."
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="pl-11"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="neo-label block mb-2">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neo-text-muted" />
                            <input
                                type="password"
                                placeholder="Enter password..."
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="pl-11"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-neo w-full justify-center py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Access System'}
                    </button>
                </form>

                <p className="text-center text-neo-text-muted text-sm font-rajdhani">
                    No account?{' '}
                    <Link to="/register" className="text-neo-green hover:underline font-semibold uppercase tracking-wide">
                        Register Node
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
