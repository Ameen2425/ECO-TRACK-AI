import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car, Zap, Utensils, Trash2, Home, ArrowRight,
    ChevronLeft, Info, Check, Leaf, Activity, HelpCircle, Bike, Bus, Train, PersonStanding
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VEHICLE_DATA, YEAR_DATA } from '../data/vehicles';

// ── Searchable Dropdown ────────────────────────────────────────────────────────
const SearchableDropdown = ({ options, value, onChange, placeholder, label, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative space-y-2">
            {label && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</span>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-eco-border text-left text-sm flex justify-between items-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-eco-green'}`}
            >
                <span className={value ? 'text-text-light dark:text-text-dark font-medium' : 'text-text-muted opacity-50 font-medium italic'}>
                    {value || placeholder}
                </span>
                <ChevronLeft size={16} className={`transition-transform duration-300 opacity-40 ${isOpen ? '-rotate-90' : 'rotate-180'}`} />
            </button>

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[60] w-full mt-2 bg-white dark:bg-gray-800 border border-eco-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b border-eco-border">
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border outline-none text-xs"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto no-scrollbar">
                            {filtered.length > 0 ? (
                                filtered.map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full px-4 py-3 text-left text-xs transition-colors hover:bg-eco-green/5 ${opt === value ? 'bg-eco-green/10 text-eco-green font-bold' : 'text-text-muted'}`}
                                    >
                                        {opt}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-text-muted italic opacity-50">No options found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Categories ────────────────────────────────────────────────────────────────
const categories = [
    { id: 'transport',   name: 'Transport',      icon: Car,      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)',  description: 'Emissions from vehicles like cars, bikes, and buses.' },
    { id: 'electricity', name: 'Electricity',    icon: Zap,      color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)',  description: 'Energy consumed at home from electrical sources.' },
    { id: 'gas',         name: 'Gas & Cooking',  icon: Home,     color: '#059669', bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.2)',  description: 'LPG, PNG, or other cooking/heating fuel usage.' },
    { id: 'waste',       name: 'Waste',          icon: Trash2,   color: '#0284C7', bg: 'rgba(2,132,199,0.08)',   border: 'rgba(2,132,199,0.2)',  description: 'Environmental impact of your waste disposal habits.' },
    { id: 'diet',        name: 'Food & Diet',    icon: Utensils, color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)', description: 'Carbon impact of your daily meals and diet choices.' },
];

// ── Quick Estimate Options ────────────────────────────────────────────────────
const TRAVEL_MODES   = ['Walk', 'Cycle', 'Bike', 'Bus', 'Train', 'Car'];
const FREQ_OPTIONS   = ['Low', 'Moderate', 'High'];
const VEHICLE_AGES   = ['New (0–2 yrs)', 'Medium (3–5 yrs)', 'Older (6–10 yrs)', 'Old (10+ yrs)'];
const HOUSE_SIZES    = ['Small', 'Medium', 'Large'];
const AC_OPTIONS     = ['Never', 'Sometimes', 'Daily'];
const FAM_SIZES      = ['1–2', '3–4', '5+'];
const COOK_FUELS     = ['LPG', 'PNG', 'Electric Stove', 'Induction'];
const COOK_FREQ      = ['Once a day', 'Twice a day', 'More than twice'];
const WASTE_LEVELS   = ['Low', 'Medium', 'High'];
const WASTE_TYPES    = ['Food', 'Plastic', 'Paper', 'Mixed'];
const RECYCLE_OPTS   = ['Always', 'Sometimes', 'Never'];
const DIET_TYPES     = ['Vegan', 'Vegetarian', 'Eggetarian', 'Non-Veg'];
const MEAT_FREQ      = ['Never', 'Rarely', 'Weekly', 'Daily'];
const DAIRY_OPTS     = ['Low', 'Medium', 'High'];
//  Detailed transport
const VEHICLE_TYPES  = ['Walk', 'Cycle', 'Bike', 'Car', 'Bus', 'Train'];
const FUEL_TYPES_BIKE= ['Petrol', 'Electric'];
const FUEL_TYPES_CAR = ['Petrol', 'Diesel', 'Electric', 'CNG'];

const AGE_MAP = {
    'New (0–2 yrs)': 1, 'Medium (3–5 yrs)': 4, 'Older (6–10 yrs)': 8, 'Old (10+ yrs)': 12
};

// ── Utility components ────────────────────────────────────────────────────────
const Tooltip = ({ text }) => (
    <div className="relative group cursor-help inline-block ml-1">
        <Info size={12} className="text-text-muted opacity-50 group-hover:opacity-100 transition" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2.5 bg-gray-900 dark:bg-gray-800 text-white text-[9px] leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl border border-white/10">
            {text}
        </div>
    </div>
);

const FieldLabel = ({ label, tip }) => (
    <div className="flex items-center gap-1 mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</span>
        {tip && <Tooltip text={tip} />}
    </div>
);

const ChipGroup = ({ options, value, onChange, color, multi = false }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(opt => {
            const active = multi
                ? (Array.isArray(value) ? value.includes(opt) : false)
                : value === opt || value === opt.toLowerCase();
            return (
                <button
                    key={opt} type="button"
                    onClick={() => {
                        if (multi) {
                            const arr = Array.isArray(value) ? [...value] : [];
                            onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt]);
                        } else {
                            onChange(opt);
                        }
                    }}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        active
                            ? 'text-white border-transparent shadow-md scale-[1.02]'
                            : 'bg-gray-50/60 dark:bg-gray-900/40 border-eco-border text-text-muted hover:opacity-90'
                    }`}
                    style={active ? { background: color, borderColor: color } : {}}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

const Toggle = ({ checked, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-center gap-3 group"
    >
        <div className={`w-10 h-6 rounded-full p-0.5 transition-all duration-300 ${checked ? 'bg-eco-green' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        {label && <span className="text-xs font-medium text-text-muted group-hover:text-text-light dark:group-hover:text-text-dark transition-colors">{label}</span>}
    </button>
);

const NumInput = ({ value, onChange, unit, placeholder = '0.00' }) => (
    <div className="relative group">
        <input
            type="number"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border focus:border-eco-green focus:ring-1 focus:ring-eco-green/20 outline-none font-inter font-black text-2xl text-right transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{unit}</span>
    </div>
);

// ── Defaults ──────────────────────────────────────────────────────────────────
const Q_DEFAULTS = {
    travel_mode: 'Car', travel_frequency: 'Moderate', vehicle_age_label: 'Medium (3–5 yrs)',
    house_size: 'Medium', ac_usage: 'Sometimes', geyser_usage: true, family_size: '3–4',
    cooking_fuel: 'LPG', cooking_frequency: 'Twice a day',
    waste_level: 'Medium', waste_types: ['Mixed'], recycling_habit: 'Sometimes', composting: false,
    diet_type: 'Non-Veg', meal_frequency: 'Weekly', dairy_level: 'Medium',
};
const D_DEFAULTS = {
    transport_type: 'Car', vehicle_brand: '', vehicle_model: '', vehicle_year: '',
    fuel_detail: '', base_factor: 0, ref_mileage: 0, actual_mileage: '',
    driving_condition: 'mixed',
    transport_km: '', electricity_kwh: '', ac_hours: '', geyser_usage: false,
    gas_usage: '', cooking_fuel: 'LPG', cooking_frequency: 'Twice a day',
    waste_kg: '', waste_type: 'Mixed', recycling_habit: 'Sometimes', composting: false,
    diet_type: 'Non-Veg', meal_frequency: 'Weekly', dairy_level: 'Medium',
    family_size: '3–4',
};

// ── Main Component ────────────────────────────────────────────────────────────
const AddEmissionPage = () => {
    const [mode, setMode]           = useState('detailed'); // 'quick' | 'detailed'
    const [activeIdx, setActiveIdx] = useState(0);
    const [qData, setQData]         = useState({ ...Q_DEFAULTS });
    const [dData, setDData]         = useState({ ...D_DEFAULTS });
    const navigate = useNavigate();

    const cat    = categories[activeIdx];
    const CatIcon= cat.icon;
    const isQuick= mode === 'quick';

    const setQ = (field, val) => setQData(p => ({ ...p, [field]: val }));
    const setD = (field, val) => setDData(p => ({ ...p, [field]: val }));

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const cat    = categories[activeIdx];
    const CatIcon= cat.icon;
    const isQuick= mode === 'quick';

    const setQ = (field, val) => setQData(p => ({ ...p, [field]: val }));
    const setD = (field, val) => setDData(p => ({ ...p, [field]: val }));

    const handleNext = () => {
        if (activeIdx < categories.length - 1) {
            setActiveIdx(i => i + 1);
        } else {
            // Build submission payload
            let payload;
            if (isQuick) {
                const freq2api = { 'Once a day': 'once', 'Twice a day': 'twice', 'More than twice': 'more' };
                payload = {
                    entry_mode: 'quick',
                    transport_type: qData.travel_mode.toLowerCase(),
                    travel_frequency: qData.travel_frequency.toLowerCase(),
                    vehicle_age_years: AGE_MAP[qData.vehicle_age_label] || 4,
                    house_size: qData.house_size.toLowerCase(),
                    ac_usage: qData.ac_usage.toLowerCase(),
                    geyser_usage: qData.geyser_usage,
                    family_size: qData.family_size,
                    cooking_fuel: qData.cooking_fuel.toLowerCase(),
                    cooking_frequency: freq2api[qData.cooking_frequency] || 'twice',
                    waste_level: qData.waste_level.toLowerCase(),
                    waste_type: Array.isArray(qData.waste_types) ? qData.waste_types.join(',') : qData.waste_types,
                    recycling_habit: qData.recycling_habit.toLowerCase(),
                    composting: qData.composting,
                    diet_type: qData.diet_type.toLowerCase().replace('-', '_'),
                    meal_frequency: qData.meal_frequency.toLowerCase(),
                    dairy_level: qData.dairy_level.toLowerCase(),
                };
            } else {
                payload = {
                    entry_mode: 'detailed',
                    transport_type: dData.transport_type.toLowerCase(),
                    vehicle_brand: dData.vehicle_brand,
                    vehicle_model: dData.vehicle_model,
                    vehicle_year: dData.vehicle_year,
                    fuel_detail: dData.fuel_detail.toLowerCase(),
                    base_factor: dData.base_factor || 0,
                    ref_mileage: dData.ref_mileage || 0,
                    actual_mileage: parseFloat(dData.actual_mileage) || 0,
                    driving_condition: dData.driving_condition,
                    vehicle_age_years: dData.vehicle_year ? (new Date().getFullYear() - parseInt(dData.vehicle_year)) : 0,
                    transport_km: parseFloat(dData.transport_km) || 0,
                    electricity_kwh: parseFloat(dData.electricity_kwh) || 0,
                    ac_hours: parseFloat(dData.ac_hours) || 0,
                    geyser_usage: dData.geyser_usage,
                    gas_usage: parseFloat(dData.gas_usage) || 0,
                    cooking_fuel: dData.cooking_fuel.toLowerCase(),
                    cooking_frequency: dData.cooking_frequency,
                    waste_kg: parseFloat(dData.waste_kg) || 0,
                    waste_type: dData.waste_type,
                    recycling_habit: dData.recycling_habit.toLowerCase(),
                    composting: dData.composting,
                    diet_type: dData.diet_type.toLowerCase().replace('-', '_'),
                    meal_frequency: dData.meal_frequency.toLowerCase(),
                    dairy_level: dData.dairy_level.toLowerCase(),
                    family_size: dData.family_size,
                };
            }
            localStorage.setItem('pendingEmission', JSON.stringify(payload));
            navigate('/calculation-process');
        }
    };

    // ── Quick Estimate Panel ─────────────────────────────────────────────────
    const QuickPanel = () => {
        if (cat.id === 'transport') return (
            <div className="space-y-8">
                <div className="space-y-4">
                    <FieldLabel label="How do you mostly travel?" />
                    <ChipGroup options={TRAVEL_MODES} value={qData.travel_mode} onChange={v => setQ('travel_mode', v)} color={cat.color} />
                </div>
                {!['Walk','Cycle'].includes(qData.travel_mode) && (
                    <div className="space-y-4">
                        <FieldLabel label="Travel Frequency" />
                        <ChipGroup options={FREQ_OPTIONS} value={qData.travel_frequency} onChange={v => setQ('travel_frequency', v)} color={cat.color} />
                    </div>
                )}
                {['Bike','Car'].includes(qData.travel_mode) && (
                    <div className="space-y-4">
                        <FieldLabel label="Vehicle Age" tip="Older vehicles produce more carbon emissions due to lower efficiency." />
                        <ChipGroup options={VEHICLE_AGES} value={qData.vehicle_age_label} onChange={v => setQ('vehicle_age_label', v)} color={cat.color} />
                    </div>
                )}
            </div>
        );
        if (cat.id === 'electricity') return (
            <div className="space-y-8">
                <div className="space-y-4"><FieldLabel label="House Size" /><ChipGroup options={HOUSE_SIZES} value={qData.house_size} onChange={v => setQ('house_size', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="AC Usage" /><ChipGroup options={AC_OPTIONS} value={qData.ac_usage} onChange={v => setQ('ac_usage', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="Family Size" /><ChipGroup options={FAM_SIZES} value={qData.family_size} onChange={v => setQ('family_size', v)} color={cat.color} /></div>
                <div className="flex items-center gap-4"><Toggle checked={qData.geyser_usage} onChange={v => setQ('geyser_usage', v)} /><span className="text-sm font-medium">Geyser / Water Heater used</span></div>
            </div>
        );
        if (cat.id === 'gas') return (
            <div className="space-y-8">
                <div className="space-y-4"><FieldLabel label="Cooking Fuel Type" /><ChipGroup options={COOK_FUELS} value={qData.cooking_fuel} onChange={v => setQ('cooking_fuel', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="How often do you cook?" /><ChipGroup options={COOK_FREQ} value={qData.cooking_frequency} onChange={v => setQ('cooking_frequency', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="Family Size" /><ChipGroup options={FAM_SIZES} value={qData.family_size} onChange={v => setQ('family_size', v)} color={cat.color} /></div>
            </div>
        );
        if (cat.id === 'waste') return (
            <div className="space-y-8">
                <div className="space-y-4"><FieldLabel label="Daily Waste Level" /><ChipGroup options={WASTE_LEVELS} value={qData.waste_level} onChange={v => setQ('waste_level', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="Type of Waste (select all that apply)" /><ChipGroup options={WASTE_TYPES} value={qData.waste_types} onChange={v => setQ('waste_types', v)} color={cat.color} multi /></div>
                <div className="space-y-4"><FieldLabel label="Recycling Habit" /><ChipGroup options={RECYCLE_OPTS} value={qData.recycling_habit} onChange={v => setQ('recycling_habit', v)} color={cat.color} /></div>
                <div className="flex items-center gap-4"><Toggle checked={qData.composting} onChange={v => setQ('composting', v)} /><span className="text-sm font-medium">I compost food waste</span></div>
            </div>
        );
        if (cat.id === 'diet') return (
            <div className="space-y-8">
                <div className="space-y-4"><FieldLabel label="Diet Type" /><ChipGroup options={DIET_TYPES} value={qData.diet_type} onChange={v => setQ('diet_type', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="How often do you eat meat?" /><ChipGroup options={MEAT_FREQ} value={qData.meal_frequency} onChange={v => setQ('meal_frequency', v)} color={cat.color} /></div>
                <div className="space-y-4"><FieldLabel label="Dairy Consumption" /><ChipGroup options={DAIRY_OPTS} value={qData.dairy_level} onChange={v => setQ('dairy_level', v)} color={cat.color} /></div>
            </div>
        );
        return null;
    };

    // ── Detailed Entry Panel ─────────────────────────────────────────────────
    const DetailedPanel = () => {
        if (cat.id === 'transport') {
            const isVehicle = ['Bike','Car'].includes(dData.transport_type);
            const typeKey = dData.transport_type.toLowerCase();
            const brands = isVehicle ? VEHICLE_DATA[typeKey].map(b => b.brand) : [];
            const selectedBrandData = isVehicle ? VEHICLE_DATA[typeKey].find(b => b.brand === dData.vehicle_brand) : null;
            const models = selectedBrandData ? selectedBrandData.models.map(m => m.name) : [];
            
            const handleBrandChange = (brand) => {
                setD('vehicle_brand', brand);
                setD('vehicle_model', '');
                setD('fuel_detail', '');
                setD('base_factor', 0);
            };

            const handleModelChange = (modelName) => {
                const modelData = selectedBrandData.models.find(m => m.name === modelName);
                if (modelData) {
                    setD('vehicle_model', modelName);
                    setD('fuel_detail', modelData.fuel);
                    setD('base_factor', modelData.factor);
                    setD('ref_mileage', modelData.ref_mileage);
                }
            };

            const fuelUnit = isVehicle && selectedBrandData?.models.find(m => m.name === dData.vehicle_model)?.ref_unit || 'km/L';

            return (
                <div className="space-y-8">
                    <div className="space-y-4"><FieldLabel label="Vehicle Type" /><ChipGroup options={VEHICLE_TYPES} value={dData.transport_type} onChange={v => setD('transport_type', v)} color={cat.color} /></div>
                    
                    {isVehicle ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                            <SearchableDropdown 
                                label="Brand" 
                                placeholder="Select Brand" 
                                options={brands} 
                                value={dData.vehicle_brand} 
                                onChange={handleBrandChange} 
                            />
                            <SearchableDropdown 
                                label="Model" 
                                placeholder="Select Model" 
                                options={models} 
                                value={dData.vehicle_model} 
                                onChange={handleModelChange} 
                                disabled={!dData.vehicle_brand}
                            />
                            <SearchableDropdown 
                                label="Model Year" 
                                placeholder="Select Year" 
                                options={Array.from({length: 26}, (_, i) => (new Date().getFullYear() - i).toString())} 
                                value={dData.vehicle_year} 
                                onChange={v => setD('vehicle_year', v)} 
                                disabled={!dData.vehicle_model}
                            />
                            <div className="space-y-2">
                                <FieldLabel label="Fuel Type" />
                                <div className="px-4 py-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-eco-border text-xs font-bold text-text-muted flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-eco-green" />
                                    {dData.fuel_detail || 'N/A'}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {isVehicle && dData.vehicle_model && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 border border-eco-border">
                            <div className="space-y-4">
                                <FieldLabel label="Driving Condition" tip="City driving usually increases consumption by 20% due to stop-and-go traffic." />
                                <ChipGroup 
                                    options={['City', 'Mixed', 'Highway']} 
                                    value={dData.driving_condition.charAt(0).toUpperCase() + dData.driving_condition.slice(1)} 
                                    onChange={v => setD('driving_condition', v.toLowerCase())} 
                                    color={cat.color} 
                                />
                            </div>
                            <div className="space-y-4">
                                <FieldLabel label="Custom Mileage (Optional)" tip="Enter your actual mileage for a more personalized calculation." />
                                <div className="space-y-2">
                                    <NumInput 
                                        value={dData.actual_mileage} 
                                        onChange={v => setD('actual_mileage', v)} 
                                        unit={fuelUnit} 
                                        placeholder={dData.ref_mileage.toString()} 
                                    />
                                    <p className="text-[9px] text-text-muted italic opacity-60">Reference for this model: {dData.ref_mileage} {fuelUnit}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                        <div className="space-y-3">
                            <FieldLabel label="Distance Traveled Today" />
                            <NumInput value={dData.transport_km} onChange={v => setD('transport_km', v)} unit="km" />
                        </div>
                        {isVehicle && dData.base_factor > 0 && (
                            <div className="space-y-2">
                                <FieldLabel label="Reference Base Factor" />
                                <div className="px-4 py-4 rounded-2xl bg-analytics-blue/5 border border-analytics-blue/10 text-xs font-black text-analytics-blue">
                                    {dData.base_factor} kg CO₂ / km
                                </div>
                            </div>
                        )}
                    </div>

                    {dData.vehicle_year && (
                        <div className="p-5 rounded-2xl bg-eco-green/5 border border-eco-green/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-eco-green" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-eco-green">Efficiency Analysis</span>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                A {dData.vehicle_year} {dData.vehicle_model} has an age of <span className="font-bold text-text-light dark:text-text-dark">{new Date().getFullYear() - dData.vehicle_year} years</span>. 
                                This will apply a <span className="font-black text-eco-green">×{
                                    (new Date().getFullYear() - dData.vehicle_year) <= 2 ? '1.0' :
                                    (new Date().getFullYear() - dData.vehicle_year) <= 5 ? '1.1' :
                                    (new Date().getFullYear() - dData.vehicle_year) <= 10 ? '1.25' : '1.5'
                                }</span> age multiplier to account for potential efficiency loss.
                            </p>
                        </div>
                    )}
                </div>
            );
        }
        if (cat.id === 'electricity') return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3"><FieldLabel label="Monthly Electricity (kWh)" /><NumInput value={dData.electricity_kwh} onChange={v => setD('electricity_kwh', v)} unit="kWh" /></div>
                    <div className="space-y-3"><FieldLabel label="AC Usage (hours/day)" /><NumInput value={dData.ac_hours} onChange={v => setD('ac_hours', v)} unit="hr/day" /></div>
                </div>
                <div className="space-y-3"><FieldLabel label="Family Size" /><ChipGroup options={FAM_SIZES} value={dData.family_size} onChange={v => setD('family_size', v)} color={cat.color} /></div>
                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3"><Toggle checked={dData.geyser_usage} onChange={v => setD('geyser_usage', v)} /><span className="text-sm">Geyser / Water Heater</span></div>
                </div>
                <div className="p-4 rounded-2xl bg-analytics-blue/5 border border-analytics-blue/10 flex gap-3 items-center">
                    <Activity className="text-analytics-blue shrink-0" size={16} />
                    <p className="text-[10px] text-text-muted leading-relaxed">Global average for one person is approx <span className="font-bold text-analytics-blue">8–10 kWh/day</span> in urban areas.</p>
                </div>
            </div>
        );
        if (cat.id === 'gas') return (
            <div className="space-y-6">
                <div className="space-y-3"><FieldLabel label="Cooking Fuel Type" /><ChipGroup options={COOK_FUELS} value={dData.cooking_fuel} onChange={v => setD('cooking_fuel', v)} color={cat.color} /></div>
                <div className="space-y-3"><FieldLabel label="Cooking Frequency" /><ChipGroup options={COOK_FREQ} value={dData.cooking_frequency} onChange={v => setD('cooking_frequency', v)} color={cat.color} /></div>
                {dData.cooking_fuel === 'LPG' && (
                    <div className="space-y-3"><FieldLabel label="Approx Gas Cylinder Usage (units/day)" /><NumInput value={dData.gas_usage} onChange={v => setD('gas_usage', v)} unit="units" /></div>
                )}
                <div className="space-y-3"><FieldLabel label="Family Size" /><ChipGroup options={FAM_SIZES} value={dData.family_size} onChange={v => setD('family_size', v)} color={cat.color} /></div>
            </div>
        );
        if (cat.id === 'waste') return (
            <div className="space-y-6">
                <div className="space-y-3"><FieldLabel label="Non-Recyclable Waste Weight" /><NumInput value={dData.waste_kg} onChange={v => setD('waste_kg', v)} unit="kg" /></div>
                <div className="space-y-3"><FieldLabel label="Primary Waste Type" /><ChipGroup options={WASTE_TYPES} value={dData.waste_type} onChange={v => setD('waste_type', v)} color={cat.color} /></div>
                <div className="space-y-3"><FieldLabel label="Recycling Habit" /><ChipGroup options={RECYCLE_OPTS} value={dData.recycling_habit} onChange={v => setD('recycling_habit', v)} color={cat.color} /></div>
                <div className="flex items-center gap-3"><Toggle checked={dData.composting} onChange={v => setD('composting', v)} /><span className="text-sm">I compost food waste</span></div>
                {(dData.recycling_habit === 'Always' || dData.composting) && (
                    <div className="p-4 rounded-2xl bg-eco-green/5 border border-eco-green/10 flex gap-3 items-center">
                        <Leaf size={16} className="text-eco-green shrink-0" />
                        <p className="text-[10px] text-text-muted">Great! Recycling & composting reduce your waste emissions by up to <span className="font-bold text-eco-green">50%</span>.</p>
                    </div>
                )}
            </div>
        );
        if (cat.id === 'diet') return (
            <div className="space-y-6">
                <div className="space-y-3"><FieldLabel label="Your Diet Type" /><ChipGroup options={DIET_TYPES} value={dData.diet_type} onChange={v => setD('diet_type', v)} color={cat.color} /></div>
                <div className="space-y-3"><FieldLabel label="How often do you eat meat?" /><ChipGroup options={MEAT_FREQ} value={dData.meal_frequency} onChange={v => setD('meal_frequency', v)} color={cat.color} /></div>
                <div className="space-y-3"><FieldLabel label="Dairy Consumption" /><ChipGroup options={DAIRY_OPTS} value={dData.dairy_level} onChange={v => setD('dairy_level', v)} color={cat.color} /></div>
                <div className="p-4 rounded-2xl bg-eco-green/5 border border-eco-green/10 flex gap-3 items-center">
                    <Leaf size={16} className="text-eco-green shrink-0" />
                    <p className="text-[10px] text-text-muted">Choosing <span className="font-bold text-eco-green uppercase">Vegan</span> for one day saves up to 4 kg CO₂e.</p>
                </div>
            </div>
        );
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl pb-12 flex flex-col gap-8"
        >
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark uppercase">Add Emission Data</h2>
                <p className="text-xs text-text-muted mt-1">Log your daily activities to calculate your carbon footprint.</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl border border-eco-border">
                <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-eco-border shadow-sm">
                    {[
                        { id: 'quick',    label: '⚡ Quick Estimate',  desc: 'Answer simple lifestyle questions' },
                        { id: 'detailed', label: '📊 Detailed Entry',   desc: 'Enter exact values manually' },
                    ].map(m => (
                        <button key={m.id} type="button"
                            onClick={() => setMode(m.id)}
                            className={`px-4 py-2 rounded-lg transition-all text-left ${mode === m.id ? 'bg-eco-green text-white shadow-md' : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <div className="text-[10px] font-black uppercase tracking-wider">{m.label}</div>
                            <div className={`text-[9px] mt-0.5 ${mode === m.id ? 'opacity-80' : 'opacity-50'}`}>{m.desc}</div>
                        </button>
                    ))}
                </div>
                {isQuick && (
                    <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-full bg-eco-green/10 border border-eco-green/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-eco-green">Values Auto-Estimated</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span>Step {activeIdx + 1} of {categories.length} – {cat.name}</span>
                    <span>{Math.round(((activeIdx + 1) / categories.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-eco-green to-analytics-blue rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeIdx + 1) / categories.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Layout: vertical nav + main panel */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Category Nav */}
                <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                    {categories.map((c, idx) => {
                        const TabIcon = c.icon;
                        const active    = idx === activeIdx;
                        const completed = idx < activeIdx;
                        return (
                            <button
                                key={c.id} type="button"
                                onClick={() => setActiveIdx(idx)}
                                className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left min-w-[130px] lg:min-w-0 ${
                                    active ? 'bg-white dark:bg-gray-900 border-eco-green shadow-md' : 'bg-transparent border-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                    active ? 'bg-eco-green text-white' : completed ? 'bg-eco-green/10 text-eco-green' : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                                }`}>
                                    {completed ? <Check size={14} /> : <TabIcon size={14} />}
                                </div>
                                <div>
                                    <p className={`text-[11px] font-bold ${active ? 'text-text-light dark:text-text-dark' : 'text-text-muted'}`}>{c.name}</p>
                                    {active && <p className="text-[9px] text-eco-green font-black uppercase tracking-widest mt-0.5">Active</p>}
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* Main Card */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="neo-card p-6 md:p-10 relative overflow-hidden"
                        >
                            {/* Bg ornament */}
                            <CatIcon className="absolute -bottom-8 -right-8 w-48 h-48 opacity-[0.03]" style={{ color: cat.color }} />

                            <div className="relative z-10 space-y-8">
                                {/* Panel header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                                        <CatIcon size={28} style={{ color: cat.color }} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                                            {isQuick ? 'Quick Estimate' : 'Detailed Entry'} · Module
                                        </p>
                                        <h3 className="font-black text-xl text-text-light dark:text-text-dark tracking-tight">
                                            {cat.name}
                                        </h3>
                                        <p className="text-[10px] text-text-muted mt-0.5">{cat.description}</p>
                                    </div>
                                </div>

                                {/* Form content */}
                                <div className="bg-gray-50/30 dark:bg-black/10 p-6 rounded-2xl border border-eco-border/40">
                                    {isQuick ? <QuickPanel /> : <DetailedPanel />}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveIdx(i => i - 1)}
                                        disabled={activeIdx === 0}
                                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeIdx === 0 ? 'opacity-0 pointer-events-none' : 'text-text-muted hover:text-text-light dark:hover:text-text-dark'}`}
                                    >
                                        <ChevronLeft size={14} /> Previous
                                    </button>

                                    <div className="flex gap-1.5">
                                        {categories.map((_, i) => (
                                            <div key={i} className={`h-1.5 rounded-full transition-all duration-400 ${i === activeIdx ? 'w-6 bg-eco-green' : i < activeIdx ? 'w-2 bg-eco-green/40' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="btn-neo px-8 gap-2 shadow-lg shadow-eco-green/20 group"
                                    >
                                        <span className="text-[10px] uppercase tracking-widest font-black">
                                            {activeIdx === categories.length - 1 ? 'Calculate Now' : 'Next Step'}
                                        </span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default AddEmissionPage;
