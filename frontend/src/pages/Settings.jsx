import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Moon, Sun, Zap, Globe, Bell, HardDrive, Eye, Shield, RefreshCw } from 'lucide-react';

const SettingsPage = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    const sections = [
        {
            title: 'Visual Interface',
            items: [
                { label: 'System Protocol', desc: 'Toggle between Light and Dark mode appearance.', action: toggleTheme, type: 'toggle', active: isDarkMode, icon: isDarkMode ? Moon : Sun },
                { label: 'Animations', desc: 'Enable fluid micro-animations across the dashboard.', type: 'toggle', active: true, icon: Zap },
                { label: 'Language', desc: 'Set global transmission language.', value: 'English (US)', icon: Globe }
            ]
        },
        {
            title: 'Neural Notifications',
            items: [
                { label: 'Push Alerts', desc: 'Receive real-time biosphere status updates.', type: 'toggle', active: true, icon: Bell },
                { label: 'Email Reports', desc: 'Weekly analytical summary delivered to your uplink.', type: 'toggle', active: false, icon: HardDrive }
            ]
        },
        {
            title: 'Security & Integrity',
            items: [
                { label: 'Privacy Mode', desc: 'Obfuscate sensitive node data in shared views.', type: 'toggle', active: false, icon: Eye },
                { label: 'Two-Factor auth', desc: 'Add an extra layer of access shielding.', status: 'Inactive', icon: Shield }
            ]
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-10 pb-12 max-w-4xl"
        >
            <div>
                <h2 className="neo-heading text-2xl font-bold tracking-tight text-text-light dark:text-text-dark">System Configurations</h2>
                <p className="neo-label mt-1 font-medium opacity-60">Calibrate global environment parameters and interface preferences</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="neo-card overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-eco-border-light dark:border-eco-border-dark bg-gray-50/30 dark:bg-gray-900/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{section.title}</h3>
                        </div>
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {section.items.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-primary-light/[0.01] transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border-light dark:border-eco-border-dark flex items-center justify-center text-text-muted group-hover:text-primary-light group-hover:border-primary-light/20 transition-all">
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-inter font-bold text-sm tracking-tight text-text-light dark:text-text-dark">{item.label}</span>
                                                <span className="text-xs text-text-muted mt-0.5 max-w-sm">{item.desc}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 self-end md:self-auto">
                                            {item.type === 'toggle' ? (
                                                <button 
                                                    onClick={item.action}
                                                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${item.active ? 'bg-primary-light' : 'bg-gray-200 dark:bg-gray-800'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            ) : item.value ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-light bg-primary-light/5 px-3 py-1 rounded-lg border border-primary-light/10">
                                                    {item.value}
                                                </span>
                                            ) : item.status ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-eco-border-light dark:border-eco-border-dark">
                                                    {item.status}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="neo-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border-l-4 border-l-secondary-light">
                <div className="space-y-1 text-center md:text-left">
                    <h3 className="font-inter font-black text-lg text-text-light dark:text-text-dark tracking-tight uppercase">
                        Master System Synchronization
                    </h3>
                    <p className="neo-label font-medium opacity-60 italic">Ensure all remote nodes are aligned with current configuration matrix</p>
                </div>
                <button className="btn-neo group px-8 gap-3 shadow-lg shadow-primary-light/10">
                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
                    <span>Sync Nodes</span>
                </button>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
