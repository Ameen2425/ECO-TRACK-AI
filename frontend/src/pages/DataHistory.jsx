import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    Trash2, Edit2, Save, X, Calendar, Activity, 
    ChevronLeft, ChevronRight, Download, Filter, 
    Search, MoreHorizontal, ArrowRight, Clock, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DataHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/emissions/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this emission record?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/emissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(history.filter(r => r.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        setEditData({ ...record });
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`http://localhost:5000/api/emissions/${editingId}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingId(null);
            fetchHistory();
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 pb-12"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-inter font-black tracking-tight text-text-light dark:text-text-dark uppercase italic">Archive History</h2>
                    <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Tracking your environmental footprint across time</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-eco-border focus:border-eco-green transition-all text-xs"
                        />
                    </div>
                    <button className="btn-neo-outline px-4 py-2 border-eco-border hover:border-eco-green group">
                        <Download size={14} className="group-hover:text-eco-green transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest ml-2">Export</span>
                    </button>
                    <Link to="/add-data" className="btn-neo bg-eco-green text-white shadow-lg shadow-eco-green/10">
                        <ArrowRight size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">New Entry</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="neo-card p-16 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="w-12 h-12 border-4 border-eco-green/10 border-t-eco-green rounded-full animate-spin" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-eco-green">Retrieving Archive</p>
                        <p className="text-[9px] font-medium opacity-40 italic">Decrypting historical emission nodes...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="neo-table-container shadow-xl overflow-x-auto">
                        <table className="neo-table neo-table-zebra">
                            <thead>
                                <tr>
                                    <th>Timeline</th>
                                    <th>Category Node</th>
                                    <th>Impact (KG CO₂)</th>
                                    <th className="text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(record => {
                                    const isEditing = editingId === record.id;
                                    return (
                                        <tr key={record.id} className={isEditing ? 'bg-analytics-blue/5' : ''}>
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-eco-border shadow-sm flex items-center justify-center text-text-muted transition-colors">
                                                        <Clock size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-text-light dark:text-text-dark">{new Date(record.created_at).toLocaleDateString()}</p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Timestamp</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-eco-green/10 border border-emerald-100 dark:border-eco-green/20 text-[8px] font-black text-eco-green uppercase tracking-wider">
                                                        {record.transport_type || 'Travel'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-analytics-blue/10 border border-blue-100 dark:border-analytics-blue/20 text-[8px] font-black text-analytics-blue uppercase tracking-wider">
                                                        {record.diet_type || 'Diet'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-6 bg-eco-green rounded-full opacity-30" />
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-black text-text-light dark:text-text-dark">{record.total_co2.toFixed(2)}</span>
                                                        <span className="text-[8px] font-bold opacity-30">KG</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-eco-green text-white shadow-lg shadow-eco-green/20 hover:scale-105 transition-transform">
                                                                <Save size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-transform">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEdit(record)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-muted hover:text-analytics-blue transition-all">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleDelete(record.id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-muted hover:text-red-500 transition-all">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Showing 1 - {history.length} of {history.length} Entries</p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-muted disabled:opacity-30" disabled>
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[1].map(p => (
                                    <button key={p} className="w-8 h-8 rounded-lg bg-eco-green text-white text-[10px] font-black">1</button>
                                ))}
                            </div>
                            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-muted disabled:opacity-30" disabled>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default DataHistory;
