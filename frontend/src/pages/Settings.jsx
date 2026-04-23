import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Moon, Sun, Zap, Globe, Bell, HardDrive, Eye, Shield,
    RefreshCw, CheckCircle, Loader, Calendar, Clock, Mail, Target
} from 'lucide-react';

const Toggle = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-eco-green/30 ${checked ? 'bg-eco-green' : 'bg-gray-200 dark:bg-gray-700'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const Select = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-eco-border bg-white dark:bg-gray-800 text-xs font-bold outline-none focus:border-eco-green transition-all"
    >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const SectionCard = ({ title, children }) => (
    <div className="neo-card overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-eco-border bg-gray-50/40 dark:bg-gray-900/30">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-text-muted">{title}</h3>
        </div>
        <div className="divide-y divide-eco-border">{children}</div>
    </div>
);

const SettingRow = ({ icon: Icon, label, desc, right }) => (
    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
        <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border flex items-center justify-center text-text-muted group-hover:text-eco-green group-hover:border-eco-green/20 transition-all shrink-0">
                <Icon size={16} />
            </div>
            <div>
                <p className="font-bold text-sm tracking-tight text-text-light dark:text-text-dark">{label}</p>
                <p className="text-[10px] text-text-muted mt-0.5 max-w-sm leading-relaxed">{desc}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">{right}</div>
    </div>
);

const SettingsPage = () => {
    const { isDarkMode, toggleTheme }  = useTheme();
    const { token }                    = useAuth();
    const [settings, setSettings]      = useState(null);
    const [saving,   setSaving]        = useState(false);
    const [saved,    setSaved]         = useState(false);
    const [loading,  setLoading]       = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/settings/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(res.data);
        } catch {
            setSettings({
                daily_reminder:     true,
                weekly_summary:     true,
                goal_reminder:      true,
                reminder_frequency: 'daily',
                animations_enabled: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, [token]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put('http://localhost:5000/api/settings/', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Settings save failed', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !settings) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-eco-green/20 border-t-eco-green rounded-full" />
        </div>
    );

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 pb-12 max-w-4xl"
        >

            <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-black uppercase tracking-tight text-text-light dark:text-text-dark">System Configurations</h2>
                <p className="text-xs text-text-muted mt-1">Calibrate your interface preferences and notification settings.</p>
            </motion.div>

            {/* Visual Interface */}
            <motion.div variants={itemVariants}>
                <SectionCard title="Visual Interface">
                    <SettingRow
                        icon={isDarkMode ? Moon : Sun}
                        label="Dark / Light Mode"
                        desc="Toggle between Light and Dark appearance for the dashboard."
                        right={<Toggle checked={isDarkMode} onChange={() => toggleTheme()} />}
                    />
                    <SettingRow
                        icon={Zap}
                        label="Animations"
                        desc="Enable fluid micro-animations and transitions across the dashboard."
                        right={<Toggle checked={settings.animations_enabled} onChange={v => set('animations_enabled', v)} />}
                    />
                    <SettingRow
                        icon={Globe}
                        label="Language"
                        desc="Set the display language for the application."
                        right={
                            <span className="text-[9px] font-black uppercase tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-3 py-1 rounded-lg">
                                English (US)
                            </span>
                        }
                    />
                </SectionCard>
            </motion.div>

            {/* Reminders & Notifications */}
            <motion.div variants={itemVariants}>
                <SectionCard title="Reminders & Notifications">
                    <SettingRow
                        icon={Bell}
                        label="Daily Reminder"
                        desc="Receive a daily prompt to log your carbon emissions data."
                        right={<Toggle checked={settings.daily_reminder} onChange={v => set('daily_reminder', v)} />}
                    />
                    <SettingRow
                        icon={HardDrive}
                        label="Weekly Summary"
                        desc="Get a weekly digest of your emissions and sustainability score."
                        right={<Toggle checked={settings.weekly_summary} onChange={v => set('weekly_summary', v)} />}
                    />
                    <SettingRow
                        icon={Target}
                        label="Goal Reminder"
                        desc="Notify when you are approaching or missing your emission targets."
                        right={<Toggle checked={settings.goal_reminder} onChange={v => set('goal_reminder', v)} />}
                    />
                    <SettingRow
                        icon={Calendar}
                        label="Reminder Frequency"
                        desc="How often would you like to receive notification reminders?"
                        right={
                            <Select
                                value={settings.reminder_frequency}
                                onChange={v => set('reminder_frequency', v)}
                                options={[
                                    { value: 'daily',   label: 'Daily' },
                                    { value: 'weekly',  label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' },
                                ]}
                            />
                        }
                    />
                    <SettingRow
                        icon={Mail}
                        label="Email Reports"
                        desc="Receive periodic analytics summary via email. (Coming soon)"
                        right={
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted bg-gray-100 dark:bg-gray-800 border border-eco-border px-3 py-1 rounded-lg">
                                Coming Soon
                            </span>
                        }
                    />
                </SectionCard>
            </motion.div>

            {/* Security */}
            <motion.div variants={itemVariants}>
                <SectionCard title="Security & Integrity">
                    <SettingRow
                        icon={Eye}
                        label="Privacy Mode"
                        desc="Obfuscate sensitive footprint data in shared or public views."
                        right={<Toggle checked={false} onChange={() => {}} disabled />}
                    />
                    <SettingRow
                        icon={Shield}
                        label="Two-Factor Authentication"
                        desc="Add an extra security layer for your account access. (Coming soon)"
                        right={
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted bg-gray-100 dark:bg-gray-800 border border-eco-border px-3 py-1 rounded-lg">
                                Inactive
                            </span>
                        }
                    />
                </SectionCard>
            </motion.div>

            {/* Save Banner */}
            <motion.div variants={itemVariants} className="neo-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-eco-green shadow-sm">
                <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-black text-base tracking-tight uppercase">Save Your Preferences</h3>
                    <p className="text-[10px] text-text-muted italic">All settings are applied instantly. Sync to persist reminders.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-neo px-8 py-3 gap-3 shadow-lg shadow-eco-green/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                >
                    {saving ? (
                        <><Loader size={15} className="animate-spin" /> Saving...</>
                    ) : saved ? (
                        <><CheckCircle size={15} /> Saved!</>
                    ) : (
                        <><RefreshCw size={15} /> Save Settings</>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default SettingsPage;
