import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    User, Mail, Shield, Leaf, Flame, Target, Activity, 
    LogOut, Edit2, Save, X, Check, Camera, Phone, 
    Lock, Upload, Award, Globe, Zap, Settings, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { token, logout } = useAuth();
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [profileImg, setProfileImg] = useState('');
    const [saveState, setSaveState] = useState('idle');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:5000/api/emissions/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([dashRes, profRes]) => {
            setData(dashRes.data);
            setName(profRes.data.name || '');
            setUsername(profRes.data.username || '');
            setEmail(profRes.data.email || '');
            setPhone(profRes.data.phone || '');
            setProfileImg(profRes.data.profile_image || '');
        }).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadImage = async () => {
        if (!image) return;
        const formData = new FormData();
        formData.append('file', image);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/upload-image', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            setProfileImg(res.data.profile_image);
            setPreview(null);
            setImage(null);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    const handleSave = async () => {
        setSaveState('saving');
        try {
            await axios.put(
                'http://localhost:5000/api/auth/profile/update',
                { name, username, email, phone, password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaveState('ok');
            setEditing(false);
            setPassword('');
            setTimeout(() => setSaveState('idle'), 2500);
        } catch {
            setSaveState('error');
            setTimeout(() => setSaveState('idle'), 3000);
        }
    };

    const co2 = data?.latest?.footprint ?? 0;
    const streak = data?.intelligence?.streak ?? 0;
    const trees = data?.intelligence?.offset?.trees_to_offset ?? 0;
    const classLabel = data?.intelligence?.classification?.label ?? 'Earth Citizen';
    const initials = (username || name).split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'EA';

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-eco-green">Accessing Personal Archive...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-10 pb-12"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Left Column: Summary & Status (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Identity Card */}
                    <div className="neo-card p-6 md:p-10 relative overflow-hidden group border-t-8 border-eco-green">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                            <User size={200} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center gap-8">
                            {/* Avatar with Glow */}
                            <div className="relative group/avatar">
                                <div className="w-32 h-32 rounded-full border-4 border-eco-green/30 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:border-eco-green/60">
                                    {preview || profileImg ? (
                                        <img src={preview || `http://localhost:5000${profileImg}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-inter font-black text-4xl text-eco-green">{initials}</span>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2">
                                        <Camera size={24} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Update</span>
                                        <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                {preview && (
                                    <button onClick={handleUploadImage} className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-eco-green text-white text-[9px] font-black uppercase rounded-xl shadow-lg hover:scale-105 transition-transform">
                                        Save
                                    </button>
                                )}
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-eco-green border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center text-white">
                                    <Zap size={14} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">
                                    {username || name || 'Eco Specialist'}
                                </h1>
                                <div className="inline-flex px-3 py-1 rounded-full bg-eco-green/10 border border-eco-green/20 text-[9px] font-black text-eco-green uppercase tracking-widest items-center gap-2">
                                    <Shield size={10} /> Verified Identity
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-eco-border">
                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Impact</p>
                                    <p className="text-xl font-black text-text-light dark:text-text-dark">{co2.toFixed(1)} <span className="text-[9px] opacity-40">KG</span></p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-eco-border">
                                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Rank</p>
                                    <p className="text-xl font-black text-eco-green">{classLabel.split(' ')[0]}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Achievement Node */}
                    <div className="neo-card p-8 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                            <Award size={14} className="text-eco-green" /> Achievement Nodes
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Climate Hero', active: true, color: '#10B981' },
                                { label: 'Power Saver', active: true, color: '#F59E0B' },
                                { label: 'Carbon Neutral', active: false, color: '#3B82F6' },
                            ].map((b, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${b.active ? 'bg-white dark:bg-gray-900 border-eco-border opacity-100' : 'bg-transparent border-dashed border-eco-border opacity-30 grayscale'}`}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: b.active ? `${b.color}10` : 'transparent', color: b.active ? b.color : 'currentColor' }}>
                                        <Award size={16} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase italic tracking-tight">{b.label}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 transition-all hover:bg-red-500 hover:text-white group">
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Editing & Settings (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="neo-card p-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-inter font-black tracking-tight uppercase italic opacity-60">Identity Configuration</h3>
                                <p className="text-[10px] font-medium opacity-40 uppercase tracking-widest">Update your ecological archive credentials</p>
                            </div>
                            <Settings size={18} className="text-text-muted opacity-30" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Archive Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-eco-border focus:border-eco-green transition-all outline-none text-sm font-medium" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Alias Handle</label>
                                <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-eco-border focus:border-eco-green transition-all outline-none text-sm font-medium" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Communication Loop</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-eco-border focus:border-eco-green transition-all outline-none text-sm font-medium" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Encrypted Terminal</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-eco-border focus:border-eco-green transition-all outline-none text-sm font-medium" />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-eco-border flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-4">
                                <button onClick={handleSave} disabled={saveState === 'saving'} className="btn-neo bg-eco-green text-white px-8 shadow-xl shadow-eco-green/20">
                                    {saveState === 'saving' ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">Commit Changes</span>
                                </button>
                                <button onClick={() => setEditing(false)} className="btn-neo-outline px-8 border-eco-border">
                                    Refresh Archive
                                </button>
                            </div>

                            {saveState === 'ok' && (
                                <div className="flex items-center gap-2 text-eco-green bg-eco-green/10 px-4 py-2 rounded-xl">
                                    <Check size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Update Successful</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Sub-card */}
                    <div className="neo-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-analytics-blue/5 border-analytics-blue/10">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-analytics-blue border border-analytics-blue/20">
                                <Lock size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase italic text-text-light dark:text-text-dark">Security Protocol</h4>
                                <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Keep your ecological identity secure</p>
                            </div>
                        </div>
                        <button className="btn-neo-outline px-6 py-3 border-analytics-blue/20 text-analytics-blue hover:bg-analytics-blue hover:text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest">Reset Credentials</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
