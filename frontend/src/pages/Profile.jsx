import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    User, Camera, Mail, Phone, AtSign, Key, Eye, EyeOff,
    Shield, CheckCircle, Loader, Leaf, Trophy, Activity, Target
} from 'lucide-react';

const StatPill = ({ label, value, unit, color = 'eco-green' }) => (
    <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-${color}/10 border border-${color}/20`}>
        <span className={`font-black text-xl text-${color}`}>{value}</span>
        <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">{label}</span>
        {unit && <span className="text-[8px] opacity-30 uppercase">{unit}</span>}
    </div>
);

const BadgeCard = ({ label, icon: Icon, desc, active }) => (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${active ? 'bg-eco-green/10 border-eco-green/30 shadow-inner' : 'bg-gray-50/50 dark:bg-gray-800/20 border-eco-border opacity-50'}`}>
        <span className="text-2xl">{typeof Icon === 'string' ? Icon : <Icon size={24} />}</span>
        <p className="text-[9px] font-black uppercase tracking-widest text-center">{label}</p>
        {desc && <p className="text-[8px] text-text-muted text-center opacity-70 leading-snug">{desc}</p>}
    </div>
);

const Profile = () => {
    const { token, user, refreshProfile } = useAuth();
    const [profile,   setProfile]  = useState(null);
    const [loading,   setLoading]  = useState(true);
    const [saving,    setSaving]   = useState(false);
    const [msg,       setMsg]      = useState({ type: '', text: '' });
    const [imgUrl,    setImgUrl]   = useState(null);
    const [showPass,  setShowPass] = useState(false);

    const [form, setForm] = useState({
        name: '', username: '', email: '', phone: '',
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const p = res.data;
            setProfile(p);
            setForm(f => ({
                ...f,
                name:     p.name     || '',
                username: p.username || '',
                email:    p.email    || '',
                phone:    p.phone    || '',
            }));
            if (p.profile_image) setImgUrl(`http://localhost:5000${p.profile_image}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleSave = async () => {
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setSaving(true);
        setMsg({ type: '', text: '' });
        try {
            await axios.put(
                'http://localhost:5000/api/auth/profile',
                {
                    name:            form.name,
                    username:        form.username,
                    email:           form.email,
                    phone:           form.phone,
                    current_password:form.currentPassword || undefined,
                    new_password:    form.newPassword     || undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            fetchProfile();
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.msg || 'Update failed. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/upload-image', fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const imgPath = res.data.profile_image;
            setImgUrl(`http://localhost:5000${imgPath}`);
            await refreshProfile(token);
            setMsg({ type: 'success', text: 'Profile picture updated!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Image upload failed.' });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px] gap-4">
            <div className="w-10 h-10 border-4 border-eco-green/20 border-t-eco-green rounded-full animate-spin" />
        </div>
    );

    const totalRecords = profile?.total_records ?? 0;
    const avgCO2       = profile?.avg_co2        ?? 0;
    const score        = Math.max(0, Math.round(100 - avgCO2 * 2));
    const carbonBadge  = avgCO2 < 8 ? '🛡️' : avgCO2 < 15 ? '🏆' : avgCO2 < 25 ? '💰' : '🌱';
    const carbonLabel  = avgCO2 < 8 ? 'Green Guardian' : avgCO2 < 15 ? 'Climate Champion' : avgCO2 < 25 ? 'Eco Saver' : 'Eco Beginner';
    const profileType  = avgCO2 < 8 ? 'Climate Conscious' : avgCO2 < 15 ? 'Low Impact' : avgCO2 < 25 ? 'Moderate Impact' : 'High Impact';
    const memberSince  = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

    const badges = [
        { emoji: '🌱', label: 'Eco Starter',    desc: 'First record logged',        active: totalRecords >= 1 },
        { emoji: '📊', label: 'Data Tracker',   desc: '10+ records logged',         active: totalRecords >= 10 },
        { emoji: '🏆', label: 'Champion',       desc: 'Score above 70',             active: score >= 70 },
        { emoji: '🛡️', label: 'Green Guardian', desc: 'Avg footprint < 8 kg/day',  active: avgCO2 < 8 },
        { emoji: '💧', label: 'Water Saver',    desc: 'Consistent low footprint',   active: score >= 85 },
        { emoji: '☀️', label: 'Solar Scout',    desc: 'Active for 30 days',         active: totalRecords >= 30 },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6 pb-12 max-w-4xl">

            {/* Status message */}
            {msg.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${msg.type === 'success' ? 'bg-eco-green/10 border-eco-green/20 text-eco-green' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-500'}`}
                >
                    <CheckCircle size={16} className="shrink-0" />
                    {msg.text}
                </motion.div>
            )}

            {/* Profile hero card */}
            <div className="neo-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start shadow-sm border-t-4 border-eco-green">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-3xl bg-eco-green/10 border-2 border-eco-green/20 overflow-hidden flex items-center justify-center shadow-lg">
                        {imgUrl ? (
                            <img src={imgUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={36} className="text-eco-green" />
                        )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-eco-green text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
                        <Camera size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>

                {/* Identity */}
                <div className="flex-1 text-center md:text-left space-y-3">
                    <div>
                        <h2 className="font-black text-xl tracking-tight text-text-light dark:text-text-dark">{profile?.name || profile?.username || 'Your Profile'}</h2>
                        <p className="text-xs text-text-muted">{profile?.email}</p>
                        {memberSince && <p className="text-[9px] text-text-muted opacity-50 mt-0.5 uppercase tracking-widest">Member since {memberSince}</p>}
                    </div>

                    {/* Badge */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-eco-green/10 border border-eco-green/20 text-[9px] font-black uppercase tracking-widest text-eco-green">
                            <span>{carbonBadge}</span> {carbonLabel}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-analytics-blue/10 border border-analytics-blue/20 text-[9px] font-black uppercase tracking-widest text-analytics-blue">
                            {profileType}
                        </span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <StatPill label="Score"   value={score}         unit="/100"       color="eco-green" />
                    <StatPill label="Records" value={totalRecords}  unit="entries"    color="analytics-blue" />
                    <StatPill label="Avg CO₂" value={avgCO2.toFixed(1)} unit="kg/day" color="eco-green" />
                </div>
            </div>

            {/* Edit Form */}
            <div className="neo-card p-6 md:p-8 space-y-6 shadow-sm">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest">Account Information</h3>
                    <p className="text-[9px] text-text-muted mt-0.5">Update your personal details</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { key: 'name',     label: 'Full Name',   icon: User,   type: 'text',  placeholder: 'Your name' },
                        { key: 'username', label: 'Username',    icon: AtSign, type: 'text',  placeholder: 'Display name' },
                        { key: 'email',    label: 'Email',       icon: Mail,   type: 'email', placeholder: 'user@example.com' },
                        { key: 'phone',    label: 'Phone',       icon: Phone,  type: 'tel',   placeholder: '+91 9999 999 999' },
                    ].map(field => {
                        const Icon = field.icon;
                        return (
                            <div key={field.key} className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                    <Icon size={10} /> {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    value={form[field.key]}
                                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                    placeholder={field.placeholder}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border focus:border-eco-green focus:ring-1 focus:ring-eco-green/20 outline-none text-sm transition-all"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Password Change */}
            <div className="neo-card p-6 md:p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-analytics-blue/10 flex items-center justify-center text-analytics-blue border border-analytics-blue/20">
                        <Key size={16} />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-widest">Change Password</h3>
                        <p className="text-[9px] text-text-muted mt-0.5">Leave blank to keep current password</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                        { key: 'currentPassword', label: 'Current Password' },
                        { key: 'newPassword',     label: 'New Password' },
                        { key: 'confirmPassword', label: 'Confirm Password' },
                    ].map(f => (
                        <div key={f.key} className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{f.label}</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border focus:border-analytics-blue focus:ring-1 focus:ring-analytics-blue/20 outline-none text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light dark:hover:text-text-dark transition-colors"
                                >
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="btn-neo py-4 w-full justify-center shadow-xl shadow-eco-green/20 text-[10px] font-black uppercase tracking-widest gap-3 disabled:opacity-60"
            >
                {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {saving ? 'Saving...' : 'Save Profile'}
            </button>

            {/* Badges */}
            <div className="neo-card p-6 md:p-8 space-y-5 shadow-sm">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest">Sustainability Badges</h3>
                    <p className="text-[9px] text-text-muted mt-0.5">Earned through your eco journey</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {badges.map(b => (
                        <BadgeCard key={b.label} icon={b.emoji} label={b.label} desc={b.desc} active={b.active} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
