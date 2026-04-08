import math
from datetime import datetime, timedelta

# ─────────────────────────────────────────
#  EMISSION FACTORS (kg CO₂ per unit)
# ─────────────────────────────────────────
TRANSPORT_FACTORS = {
    # two-wheelers
    'bike_petrol':   0.05,
    'bike_electric': 0.02,
    # cars
    'car_petrol':    0.12,
    'car_diesel':    0.14,
    'car_electric':  0.03,
    'car_cng':       0.09,
    # public
    'bus':           0.04,
    'train':         0.04,
    # zero
    'walk':          0.00,
    'cycle':         0.00,
    # legacy
    'petrol':        0.12,
    'diesel':        0.14,
    'electric':      0.03,
}

# Vehicle age → multiplier
AGE_MULTIPLIER = [
    (2,  1.00),
    (5,  1.10),
    (10, 1.25),
]
DEFAULT_AGE_MULTIPLIER = 1.50  # 10+ years

DRIVING_CONDITION_FACTORS = {
    'city':    1.2,
    'mixed':   1.0,
    'highway': 0.85
}

ELECTRICITY_FACTOR = 0.82   # kg CO₂ per kWh (India average grid)
GAS_FACTOR         = 2.0    # kg CO₂ per unit (m³ / cylinder fraction)

# Gas fuel type → daily kg CO₂
GAS_FUEL_FACTORS = {
    'lpg':       1.5,
    'png':       1.2,
    'electric stove': 0.0,
    'induction':  0.0,
}

# Diet base kg CO₂ / day
DIET_BASE = {
    'vegan':        1.5,
    'vegetarian':   2.5,
    'eggetarian':   3.0,
    'non-veg':      5.0,
    'non_veg':      5.0,
    'non-vegetarian': 5.0,
}

# Meat frequency multiplier on top of diet base
MEAT_MULTIPLIER = {
    'never':  1.0,
    'rarely': 1.1,
    'weekly': 1.3,
    'daily':  1.6,
}

DAIRY_ADDON = {   # extra kg CO₂/day
    'low':    0.0,
    'medium': 0.3,
    'high':   0.6,
}

WASTE_FACTOR = 0.5   # kg CO₂ per kg waste

# Recycling / composting reductions
RECYCLING_REDUCTION = {
    'always':    0.30,
    'sometimes': 0.15,
    'never':     0.00,
}
COMPOSTING_REDUCTION = 0.20

# ─────────────────────────────────────────
#  QUICK ESTIMATE LOOKUP TABLES
# ─────────────────────────────────────────
QUICK_TRANSPORT_KM = {
    'walk': 0, 'cycle': 0,
    'bus': {'low': 5, 'moderate': 15, 'high': 30},
    'train': {'low': 10, 'moderate': 25, 'high': 50},
    'bike': {'low': 8, 'moderate': 20, 'high': 40},
    'car': {'low': 10, 'moderate': 25, 'high': 60},
}

QUICK_ELECTRICITY_KWH = {
    'small':  {'never': 4, 'sometimes': 6, 'daily': 8},
    'medium': {'never': 6, 'sometimes': 9, 'daily': 13},
    'large':  {'never': 9, 'sometimes': 14, 'daily': 20},
}

QUICK_GAS_USAGE = {
    'once':  {'1-2': 0.5, '3-4': 0.8, '5+': 1.2},
    'twice': {'1-2': 1.0, '3-4': 1.6, '5+': 2.4},
    'more':  {'1-2': 1.5, '3-4': 2.4, '5+': 3.6},
}

QUICK_WASTE_KG = {
    'low':    0.5,
    'medium': 1.5,
    'high':   3.0,
}


# ─────────────────────────────────────────
#  HELPER: get age multiplier
# ─────────────────────────────────────────
def get_age_multiplier(years):
    try:
        y = int(years or 0)
    except (ValueError, TypeError):
        y = 0
    if y <= 2:  return 1.0
    if y <= 5:  return 1.1
    if y <= 10: return 1.25
    return 1.5


# ─────────────────────────────────────────
#  HELPER: Quick → estimated numeric values
# ─────────────────────────────────────────
def quick_to_values(data):
    """
    Convert Quick Estimate lifestyle answers to numeric values.
    Returns a dict suitable for calculate_co2().
    """
    out = dict(data)

    # Transport
    mode = str(data.get('transport_type', 'walk')).lower()
    freq = str(data.get('travel_frequency', 'moderate')).lower()
    if mode in ('walk', 'cycle'):
        out['transport_km'] = 0
    elif mode in QUICK_TRANSPORT_KM and isinstance(QUICK_TRANSPORT_KM[mode], dict):
        out['transport_km'] = QUICK_TRANSPORT_KM[mode].get(freq, QUICK_TRANSPORT_KM[mode].get('moderate', 15))
    else:
        out['transport_km'] = QUICK_TRANSPORT_KM.get(mode, 15)

    # Electricity
    house = str(data.get('house_size', 'medium')).lower()
    ac    = str(data.get('ac_usage', 'sometimes')).lower()
    kwh_map = QUICK_ELECTRICITY_KWH.get(house, QUICK_ELECTRICITY_KWH['medium'])
    out['electricity_kwh'] = kwh_map.get(ac, 9)

    # Gas
    freq_cook = str(data.get('cooking_frequency', 'twice')).lower()
    fam       = str(data.get('family_size', '3-4')).lower()
    gas_map   = QUICK_GAS_USAGE.get(freq_cook, QUICK_GAS_USAGE['twice'])
    out['gas_usage'] = gas_map.get(fam, 1.6)

    # Waste
    waste_level = str(data.get('waste_level', 'medium')).lower()
    out['waste_kg'] = QUICK_WASTE_KG.get(waste_level, 1.5)

    return out


# ─────────────────────────────────────────
#  MAIN CALCULATION
# ─────────────────────────────────────────
def calculate_co2(data):
    """
    Calculates total CO₂ footprint (kg/day).
    Handles both Quick Estimate and Detailed Entry modes.
    """
    def to_f(val):
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0

    # Quick Estimate → convert first
    if str(data.get('entry_mode', 'detailed')).lower() == 'quick':
        data = quick_to_values(data)

    transport_km     = to_f(data.get('transport_km', 0))
    electricity_kwh  = to_f(data.get('electricity_kwh', 0))
    gas_usage        = to_f(data.get('gas_usage', 0))
    waste_kg         = to_f(data.get('waste_kg', 0))
    vehicle_age      = to_f(data.get('vehicle_age_years', 0))

    # --- Transport ---
    t_type = str(data.get('transport_type', 'petrol')).lower()
    fuel   = str(data.get('fuel_detail') or '').lower()

    # Priority: explicitly passed base_factor (from structured selection)
    if 'base_factor' in data and to_f(data['base_factor']) > 0:
        factor = to_f(data['base_factor'])
    else:
        # Fallback to legacy mapping
        compound_key = f"{t_type}_{fuel}" if fuel else t_type
        factor = TRANSPORT_FACTORS.get(compound_key) or TRANSPORT_FACTORS.get(t_type, 0.12)

    age_mult = get_age_multiplier(vehicle_age)
    
    # --- Multi-Factor Upgrades ---
    condition = str(data.get('driving_condition', 'mixed')).lower()
    condition_mult = DRIVING_CONDITION_FACTORS.get(condition, 1.0)
    
    actual_mileage = to_f(data.get('actual_mileage', 0))
    ref_mileage    = to_f(data.get('ref_mileage', 0))
    efficiency_mult = 1.0
    if actual_mileage > 0 and ref_mileage > 0:
        efficiency_mult = ref_mileage / actual_mileage
        
    transport_co2 = transport_km * factor * age_mult * efficiency_mult * condition_mult

    # --- Electricity ---
    electricity_co2 = electricity_kwh * ELECTRICITY_FACTOR

    # --- Gas ---
    cooking_fuel = str(data.get('cooking_fuel') or data.get('fuel_detail') or '').lower()
    if cooking_fuel in GAS_FUEL_FACTORS and gas_usage == 0:
        # Quick estimate gas from fuel type
        gas_co2 = GAS_FUEL_FACTORS.get(cooking_fuel, 1.5)
    else:
        gas_co2 = gas_usage * GAS_FACTOR

    # --- Waste ---
    recycling = str(data.get('recycling_habit', 'never')).lower()
    composting_on = bool(data.get('composting', False))
    waste_reduction = RECYCLING_REDUCTION.get(recycling, 0)
    if composting_on:
        waste_reduction = min(1.0, waste_reduction + COMPOSTING_REDUCTION)
    waste_co2 = waste_kg * WASTE_FACTOR * (1 - waste_reduction)

    # --- Food ---
    diet_raw = str(data.get('diet_type') or data.get('food_type', 'non-vegetarian')).lower()
    diet_co2 = DIET_BASE.get(diet_raw, 5.0)

    meat_freq = str(data.get('meal_frequency', 'weekly')).lower()
    diet_co2 *= MEAT_MULTIPLIER.get(meat_freq, 1.0)

    dairy = str(data.get('dairy_level', 'medium')).lower()
    diet_co2 += DAIRY_ADDON.get(dairy, 0.3)

    total = transport_co2 + electricity_co2 + diet_co2 + gas_co2 + waste_co2
    return round(total, 2)


def get_breakdown(data):
    """
    Returns per-category CO₂ breakdown dict for the Calculation Process page.
    """
    def to_f(val):
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0

    if str(data.get('entry_mode', 'detailed')).lower() == 'quick':
        data = quick_to_values(data)

    transport_km    = to_f(data.get('transport_km', 0))
    electricity_kwh = to_f(data.get('electricity_kwh', 0))
    gas_usage       = to_f(data.get('gas_usage', 0))
    waste_kg        = to_f(data.get('waste_kg', 0))
    vehicle_age     = to_f(data.get('vehicle_age_years', 0))

    t_type = str(data.get('transport_type', 'petrol')).lower()
    fuel   = str(data.get('fuel_detail') or '').lower()

    if 'base_factor' in data and to_f(data['base_factor']) > 0:
        factor = to_f(data['base_factor'])
    else:
        compound_key = f"{t_type}_{fuel}" if fuel else t_type
        factor = TRANSPORT_FACTORS.get(compound_key) or TRANSPORT_FACTORS.get(t_type, 0.12)

    age_mult = get_age_multiplier(vehicle_age)
    
    condition = str(data.get('driving_condition', 'mixed')).lower()
    condition_mult = DRIVING_CONDITION_FACTORS.get(condition, 1.0)
    
    actual_mileage = to_f(data.get('actual_mileage', 0))
    ref_mileage    = to_f(data.get('ref_mileage', 0))
    efficiency_mult = 1.0
    if actual_mileage > 0 and ref_mileage > 0:
        efficiency_mult = ref_mileage / actual_mileage

    transport_co2 = round(transport_km * factor * age_mult * efficiency_mult * condition_mult, 3)

    electricity_co2 = round(electricity_kwh * ELECTRICITY_FACTOR, 3)

    cooking_fuel = str(data.get('cooking_fuel') or '').lower()
    if cooking_fuel in GAS_FUEL_FACTORS and gas_usage == 0:
        gas_co2 = round(GAS_FUEL_FACTORS.get(cooking_fuel, 1.5), 3)
    else:
        gas_co2 = round(gas_usage * GAS_FACTOR, 3)

    recycling = str(data.get('recycling_habit', 'never')).lower()
    composting_on = bool(data.get('composting', False))
    waste_reduction = RECYCLING_REDUCTION.get(recycling, 0)
    if composting_on:
        waste_reduction = min(1.0, waste_reduction + COMPOSTING_REDUCTION)
    waste_co2 = round(waste_kg * WASTE_FACTOR * (1 - waste_reduction), 3)

    diet_raw = str(data.get('diet_type') or data.get('food_type', 'non-vegetarian')).lower()
    diet_co2 = DIET_BASE.get(diet_raw, 5.0)
    meat_freq = str(data.get('meal_frequency', 'weekly')).lower()
    diet_co2 *= MEAT_MULTIPLIER.get(meat_freq, 1.0)
    dairy = str(data.get('dairy_level', 'medium')).lower()
    diet_co2 = round(diet_co2 + DAIRY_ADDON.get(dairy, 0.3), 3)

    return {
        'transport': {
            'km': transport_km,
            'factor': factor,
            'age_multiplier': age_mult,
            'vehicle_age_years': int(vehicle_age),
            'vehicle_brand': data.get('vehicle_brand', ''),
            'vehicle_model': data.get('vehicle_model', ''),
            'vehicle_year': data.get('vehicle_year', ''),
            'fuel_detail': data.get('fuel_detail', t_type),
            'co2': transport_co2,
            'driving_condition': condition,
            'condition_multiplier': condition_mult,
            'actual_mileage': actual_mileage,
            'ref_mileage': ref_mileage,
            'efficiency_multiplier': round(efficiency_mult, 3),
            'formula': f'{transport_km} km × {factor} (Base) × {age_mult} (Age) × {round(efficiency_mult, 2)} (Efficiency) × {condition_mult} (Condition) = {transport_co2} kg CO₂',
        },
        'electricity': {
            'kwh': electricity_kwh,
            'factor': ELECTRICITY_FACTOR,
            'co2': electricity_co2,
            'formula': f'{electricity_kwh} kWh × {ELECTRICITY_FACTOR} = {electricity_co2} kg CO₂',
        },
        'gas': {
            'usage': gas_usage,
            'factor': GAS_FACTOR,
            'co2': gas_co2,
            'formula': f'{gas_usage} units × {GAS_FACTOR} = {gas_co2} kg CO₂',
        },
        'waste': {
            'kg': waste_kg,
            'factor': WASTE_FACTOR,
            'recycling_reduction': waste_reduction,
            'co2': waste_co2,
            'formula': f'{waste_kg} kg × {WASTE_FACTOR} × (1 - {waste_reduction}) = {waste_co2} kg CO₂',
        },
        'diet': {
            'diet_type': diet_raw,
            'meal_frequency': data.get('meal_frequency', ''),
            'dairy_level': data.get('dairy_level', ''),
            'co2': diet_co2,
            'formula': f'Diet:{diet_raw}, Meat:{meat_freq}, Dairy:{dairy} = {diet_co2} kg CO₂',
        },
    }


def get_sustainability_score(total_footprint):
    if total_footprint < 5:  return 95
    if total_footprint < 10: return 85
    if total_footprint < 15: return 70
    if total_footprint < 20: return 50
    if total_footprint < 30: return 30
    return 15


def get_carbon_classification(total_footprint):
    if total_footprint < 5:
        return {"label": "Green Guardian",   "badge": "🛡️", "description": "Your footprint is minimal. You are a global guardian.", "color": "#10b981"}
    if total_footprint < 15:
        return {"label": "Climate Champion", "badge": "🏆", "description": "Exemplary efficiency. Keep maintaining this level.",     "color": "#34d399"}
    if total_footprint < 25:
        return {"label": "Eco Saver",        "badge": "💰", "description": "Standard emission level. Room for minor optimization.", "color": "#fbbf24"}
    return     {"label": "Eco Beginner",     "badge": "🌱", "description": "Emission intensity is high. Deploy reduction protocols.", "color": "#ef4444"}


def get_sustainability_profile(avg_footprint):
    """Returns a user profile classification string."""
    if avg_footprint < 8:
        return "Climate Conscious"
    if avg_footprint < 15:
        return "Low Impact User"
    if avg_footprint < 25:
        return "Moderate Impact User"
    return "High Impact User"


def get_offset_data(daily_co2):
    trees_needed = daily_co2 / 21
    return {
        "daily_co2": daily_co2,
        "trees_to_offset": math.ceil(trees_needed),
        "offset_impact_percent": 100 if daily_co2 == 0 else min(100, round((0.06 / daily_co2) * 100, 1))
    }


def calculate_streak(records):
    if not records:
        return 0
    sorted_records = sorted(records, key=lambda x: x.created_at, reverse=True)
    today     = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    if sorted_records[0].created_at.date() not in [today, yesterday]:
        return 0
    streak = 0
    for record in sorted_records:
        if record.total_co2 < 15:
            streak += 1
        else:
            break
    return streak


def get_risk_indicators(latest_record):
    risks = []
    if not latest_record:
        return risks
    if latest_record.transport_km > 50:
        risks.append({"category": "Transport", "level": "High", "color": "#ef4444", "msg": "Transport footprint is critical."})
    elif latest_record.transport_km > 20:
        risks.append({"category": "Transport", "level": "Moderate", "color": "#fbbf24", "msg": "Transport usage is above average."})
    else:
        risks.append({"category": "Transport", "level": "Low", "color": "#10b981", "msg": "Transport efficiency is optimal."})

    if latest_record.electricity_kwh > 20:
        risks.append({"category": "Energy", "level": "High", "color": "#ef4444", "msg": "Power consumption is high."})
    elif latest_record.electricity_kwh > 10:
        risks.append({"category": "Energy", "level": "Moderate", "color": "#fbbf24", "msg": "Moderate energy load detected."})
    else:
        risks.append({"category": "Energy", "level": "Low", "color": "#10b981", "msg": "Energy usage is within green limits."})

    return risks


def get_weekly_stats(records):
    """Returns this week vs last week comparison."""
    now = datetime.utcnow()
    this_week_start = now - timedelta(days=now.weekday())
    last_week_start = this_week_start - timedelta(days=7)

    this_week = [r for r in records if r.created_at >= this_week_start]
    last_week = [r for r in records if last_week_start <= r.created_at < this_week_start]

    this_total = sum(r.total_co2 for r in this_week)
    last_total = sum(r.total_co2 for r in last_week)

    if last_total > 0:
        change_pct = round(((this_total - last_total) / last_total) * 100, 1)
    else:
        change_pct = 0

    return {
        "this_week": round(this_total, 2),
        "last_week": round(last_total, 2),
        "change_pct": change_pct,
        "improved": change_pct < 0,
    }


def get_monthly_stats(records):
    """Returns this month vs last month comparison."""
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 1:
        last_month_start = this_month_start.replace(year=now.year - 1, month=12)
    else:
        last_month_start = this_month_start.replace(month=now.month - 1)

    this_month = [r for r in records if r.created_at >= this_month_start]
    last_month = [r for r in records if last_month_start <= r.created_at < this_month_start]

    this_total = sum(r.total_co2 for r in this_month)
    last_total = sum(r.total_co2 for r in last_month)

    if last_total > 0:
        change_pct = round(((this_total - last_total) / last_total) * 100, 1)
    else:
        change_pct = 0

    return {
        "this_month": round(this_total, 2),
        "last_month": round(last_total, 2),
        "change_pct": change_pct,
        "improved": change_pct < 0,
    }


def get_highest_category(records):
    """Returns the category with the highest total emissions across all records."""
    if not records:
        return "N/A"

    totals = {"transport": 0, "electricity": 0, "gas": 0, "waste": 0, "diet": 0}
    for r in records:
        totals["transport"]   += (r.transport_km or 0) * 0.12
        totals["electricity"] += (r.electricity_kwh or 0) * 0.82
        totals["gas"]         += (r.gas_usage or 0) * 2.0
        totals["waste"]       += (r.waste_kg or 0) * 0.5
        # diet isn't stored numerically so we skip here

    return max(totals, key=totals.get).capitalize()
