import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, Edit2, Save, X, Calendar, Activity,
    ChevronLeft, ChevronRight, Download, Search,
    ArrowRight, Clock, Car, Zap, Utensils, Home, Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { downloadCSV } from '../utils/exportUtils';

const ITEMS_PER_PAGE = 10;

const DietBadge = ({ type }) => {
    if (!type) return null;
    const t = type.toLowerCase();
    const colors = {
        vegan: 'bg-eco-green/10 text-eco-green border-eco-green/20',
        vegetarian: 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800/30',
        eggetarian: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800/30',
        'non-veg': 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800/30',
        'non_veg': 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800/30',
        'non-vegetarian': 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800/30',
    };
    const cls = colors[t] || 'bg-gray-100 text-text-muted border-eco-border';
    return (
        <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${cls}`}>
            {type}
        </span>
    );
};

// Edit Modal
const EditModal = ({ record, onClose, onSave }) => {
    const [form, setForm] = useState({ ...record });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const fields = [
        { key: 'transport_km',     label: 'Transport (km)',     type: 'number' },
        { key: 'transport_type',   label: 'Type',               type: 'text'   },
        { key: 'vehicle_brand',    label: 'Vehicle Brand',      type: 'text'   },
        { key: 'vehicle_model',    label: 'Vehicle Model',      type: 'text'   },
        { key: 'vehicle_year',     label: 'Vehicle Year',       type: 'number' },
        { key: 'fuel_detail',      label: 'Fuel Detail',        type: 'text'   },
        { key: 'driving_condition', label: 'Condition',          type: 'text'   },
        { key: 'actual_mileage',   label: 'Actual Mileage',     type: 'number' },
        { key: 'electricity_kwh',  label: 'Electricity (kWh)',  type: 'number' },
        { key: 'gas_usage',        label: 'Gas Usage',          type: 'number' },
        { key: 'waste_kg',         label: 'Waste (kg)',         type: 'number' },
        { key: 'diet_type',        label: 'Diet Type',          type: 'text'   },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg neo-card p-6 md:p-8 shadow-2xl space-y-6 z-10"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-base uppercase tracking-tight">Edit Record</h3>
                        <p className="text-[9px] text-text-muted mt-0.5">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-red-500 transition-all">
                        <X size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map(f => (
                        <div key={f.key} className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">{f.label}</label>
                            <input
                                type={f.type}
                                value={form[f.key] ?? ''}
                                onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border focus:border-eco-green outline-none text-sm transition-all"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => onSave(form)}
                        className="flex-1 btn-neo bg-eco-green text-white shadow-lg shadow-eco-green/20 justify-center py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                        <Save size={14} /> Save Changes
                    </button>
                    <button onClick={onClose} className="btn-neo-outline px-6 py-3 text-[10px] font-black uppercase tracking-widest">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const DataHistory = () => {
    const { token } = useAuth();
    const [history,   setHistory]   = useState([]);
    const [filtered,  setFiltered]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [editRecord,setEditRecord]= useState(null);
    const [expandedRow,setExpandedRow]=useState(null);
    const [search,    setSearch]    = useState('');
    const [page,      setPage]      = useState(1);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/emissions/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error('Fetch error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, [token]);

    // Search filter
    useEffect(() => {
        if (!search.trim()) {
            setFiltered(history);
            setPage(1);
            return;
        }
        const q = search.toLowerCase();
        setFiltered(history.filter(r =>
            r.transport_type?.toLowerCase().includes(q) ||
            r.diet_type?.toLowerCase().includes(q) ||
            r.created_at?.includes(q) ||
            String(r.total_co2).includes(q)
        ));
        setPage(1);
    }, [search, history]);

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this record?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/emissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(h => h.filter(r => r.id !== id));
        } catch (err) { console.error('Delete failed', err); }
    };

    const handleSaveEdit = async (form) => {
        try {
            await axios.put(`http://localhost:5000/api/emissions/${form.id}`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditRecord(null);
            fetchHistory();
        } catch (err) { console.error('Update failed', err); }
    };

    const handleExport = () => {
        const exportData = history.map(r => ({
            Date:              new Date(r.created_at).toLocaleDateString(),
            'Transport (km)':  r.transport_km,
            'Transport Type':  r.transport_type,
            'Vehicle Brand':   r.vehicle_brand,
            'Vehicle Model':   r.vehicle_model,
            'Vehicle Year':    r.vehicle_year,
            'Fuel Detail':     r.fuel_detail,
            'Driving Cond.':   r.driving_condition,
            'Actual Mileage':  r.actual_mileage,
            'Ref. Mileage':    r.ref_mileage,
            'Electricity kWh': r.electricity_kwh,
            'Gas Usage':       r.gas_usage,
            'Waste (kg)':      r.waste_kg,
            'Diet Type':       r.diet_type,
            'Family Size':     r.family_size,
            'Total CO₂ (kg)':  r.total_co2,
        }));
        downloadCSV(exportData, 'EcoTrack_HighPrecision_History.csv');
    };

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-6 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark uppercase">Emission History</h2>
                    <p className="text-xs text-text-muted mt-1">{history.length} total records found</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search records..."
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-eco-border focus:border-eco-green outline-none text-xs transition-all"
                        />
                    </div>
                    <button onClick={handleExport} className="btn-neo-outline px-3 py-2 border-eco-border hover:border-eco-green group text-[10px] font-black uppercase tracking-widest">
                        <Download size={13} className="group-hover:text-eco-green transition-colors" />
                        <span className="hidden sm:inline ml-1.5">Export</span>
                    </button>
                    <Link to="/add-data" className="btn-neo px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-eco-green/10">
                        <ArrowRight size={13} /> New
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="neo-card p-16 flex flex-col items-center gap-6 text-center">
                    <div className="w-10 h-10 border-4 border-eco-green/10 border-t-eco-green rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-eco-green">Loading Records...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="neo-card p-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-eco-green/10 flex items-center justify-center mx-auto">
                        <Leaf size={28} className="text-eco-green" />
                    </div>
                    <p className="font-bold text-text-muted">{search ? 'No records match your search.' : 'No emission records yet.'}</p>
                    {!search && <Link to="/add-data" className="btn-neo px-6 py-2 shadow-lg inline-flex text-[10px] font-black uppercase tracking-widest">Add First Entry</Link>}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Table */}
                    <div className="neo-table-container shadow-sm overflow-x-auto">
                        <table className="neo-table neo-table-zebra min-w-[700px]">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transport</th>
                                    <th>Electricity</th>
                                    <th>Diet</th>
                                    <th>Gas</th>
                                    <th>Waste</th>
                                    <th>Total CO₂</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(record => (
                                    <React.Fragment key={record.id}>
                                        <tr onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)} className="cursor-pointer group">
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-eco-border flex items-center justify-center text-text-muted shrink-0 group-hover:bg-eco-green/10 transition-colors">
                                                        <Clock size={11} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">{new Date(record.created_at).toLocaleDateString()}</p>
                                                        <p className="text-[8px] opacity-30 uppercase tracking-widest">
                                                            {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <Car size={11} className="text-eco-green shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-medium">{record.transport_km ?? 0} km</p>
                                                        {record.transport_type && <p className="text-[8px] opacity-40 uppercase truncate max-w-[80px]">{record.vehicle_model || record.transport_type}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <Zap size={11} className="text-analytics-blue shrink-0" />
                                                    <span className="text-xs font-medium">{record.electricity_kwh ?? 0} kWh</span>
                                                </div>
                                            </td>
                                            <td><DietBadge type={record.diet_type} /></td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <Home size={11} className="text-eco-green shrink-0" />
                                                    <span className="text-xs font-medium">{record.gas_usage ?? 0}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <Trash2 size={11} className="text-text-muted shrink-0" />
                                                    <span className="text-xs font-medium">{record.waste_kg ?? 0} kg</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-5 rounded-full bg-eco-green opacity-40" />
                                                    <span className="text-sm font-black text-text-light dark:text-text-dark">{(record.total_co2 || 0).toFixed(2)}</span>
                                                    <span className="text-[8px] opacity-30 font-bold">kg</span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setEditRecord(record)}
                                                        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-analytics-blue hover:bg-analytics-blue/10 transition-all border border-transparent hover:border-analytics-blue/20"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRow === record.id && (
                                            <tr>
                                                <td colSpan="8" className="bg-gray-50/50 dark:bg-gray-800/30 p-0 border-b border-eco-border">
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }} 
                                                        animate={{ opacity: 1, height: 'auto' }} 
                                                        className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Vehicle Details</p>
                                                            <p className="text-[10px] font-bold">{record.vehicle_brand || '—'} {record.vehicle_model || ''}</p>
                                                            <p className="text-[9px] text-text-muted capitalize">{record.fuel_detail || 'Standard Fuel'} • {record.vehicle_year || '—'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Driving Factor</p>
                                                            <p className="text-[10px] font-bold capitalize">{record.driving_condition || 'Mixed Conditions'}</p>
                                                            <p className="text-[9px] text-text-muted">Age Multiplier: {record.age_multiplier?.toFixed(2) || '1.00'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Fuel Efficiency</p>
                                                            <p className="text-[10px] font-bold">{record.actual_mileage || '—'} km/L</p>
                                                            <p className="text-[9px] text-text-muted">Ref: {record.ref_mileage || '—'} km/L</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Entry Method</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-eco-green">{record.entry_mode || 'Basic'}</p>
                                                        </div>
                                                        <div className="col-span-2 flex items-center justify-end">
                                                            <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-eco-border shadow-sm">
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 text-center">Precision CO₂ Breakdown</p>
                                                                <div className="flex items-center gap-4 text-xs">
                                                                    <div className="flex flex-col items-center"><span className="font-bold">{(record.total_co2 * 0.4).toFixed(1)}</span><span className="text-[8px] opacity-40">Transport</span></div>
                                                                    <div className="flex flex-col items-center"><span className="font-bold">{(record.total_co2 * 0.3).toFixed(1)}</span><span className="text-[8px] opacity-40">Energy</span></div>
                                                                    <div className="flex flex-col items-center"><span className="font-bold text-eco-green">{(record.total_co2).toFixed(1)}</span><span className="text-[8px] font-black uppercase text-eco-green">Total</span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-eco-green transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${p === page ? 'bg-eco-green text-white shadow-md shadow-eco-green/30' : 'bg-gray-100 dark:bg-gray-800 text-text-muted hover:text-eco-green'}`}
                                    >{p}</button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted disabled:opacity-30 hover:text-eco-green transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editRecord && (
                    <EditModal
                        record={editRecord}
                        onClose={() => setEditRecord(null)}
                        onSave={handleSaveEdit}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DataHistory;
