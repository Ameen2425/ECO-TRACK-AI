import math
from datetime import datetime, timedelta

# Standard Emission Factors (approximate values in kg CO2e per unit)
EMISSION_FACTORS = {
    'transport': {
        'petrol': 0.18,  # per km
        'diesel': 0.17,
        'electric': 0.05,
        'bus': 0.03,
        'bike': 0.0,
        'walk': 0.0,
        # Legacy support
        'car_petrol': 0.18,
        'car_diesel': 0.17,
        'car_electric': 0.05
    },
    'energy': {
        'electricity': 0.5,  # per kWh (average grid)
        'gas': 2.0           # per m3 or unit
    },
    'food': {
        'vegan': 1.5,       # per day
        'vegetarian': 2.5,
        'non-vegetarian': 5.0,
        'non_veg': 5.0      # legacy support
    },
    'waste': {
        'general': 0.5      # per kg
    }
}

def calculate_co2(data):
    """
    Calculates total CO2 footprint based on input data.
    Robustly handles string inputs from frontend by casting to float.
    """
    def to_f(val):
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0

    transport_km = to_f(data.get('transport_km', 0))
    electricity_kwh = to_f(data.get('electricity_kwh', 0))
    gas_usage = to_f(data.get('gas_usage', 0))
    waste_kg = to_f(data.get('waste_kg', 0))

    t_type = str(data.get('transport_type', 'petrol')).lower()
    transport_co2 = transport_km * EMISSION_FACTORS['transport'].get(t_type, 0.18)
    
    electricity_co2 = electricity_kwh * EMISSION_FACTORS['energy']['electricity']
    
    # Handle food impact
    food_val = str(data.get('food_type') or data.get('diet_type', 'non-vegetarian')).lower()
    food_co2 = EMISSION_FACTORS['food'].get(food_val, 5.0)
    
    gas_co2 = gas_usage * EMISSION_FACTORS['energy']['gas']
    waste_co2 = waste_kg * EMISSION_FACTORS['waste']['general']
    
    total = transport_co2 + electricity_co2 + food_co2 + gas_co2 + waste_co2
    return round(total, 2)

def get_sustainability_score(total_footprint):
    """
    Returns a score from 0-100 based on the footprint.
    Lower footprint = Higher score.
    Average daily footprint is around 15-20kg.
    """
    if total_footprint < 5: return 95
    if total_footprint < 10: return 85
    if total_footprint < 15: return 70
    if total_footprint < 20: return 50
    if total_footprint < 30: return 30
    return 15

def get_carbon_classification(total_footprint):
    """
    Classifies user based on daily CO2 footprint and assigns badges.
    """
    if total_footprint < 5:
        return {
            "label": "Green Guardian",
            "badge": "🛡️",
            "description": "Your footprint is minimal. You are a global guardian.",
            "color": "#10b981" # Emerald-500
        }
    if total_footprint < 15:
        return {
            "label": "Climate Champion",
            "badge": "🏆",
            "description": "Exemplary efficiency. Keep maintaining this level.",
            "color": "#34d399" # Emerald-400
        }
    if total_footprint < 25:
        return {
            "label": "Eco Saver",
            "badge": "💰",
            "description": "Standard emission level. Room for minor optimization.",
            "color": "#fbbf24" # Amber-400
        }
    return {
        "label": "Eco Beginner",
        "badge": "🌱",
        "description": "Emission intensity is high. Deploy reduction protocols.",
        "color": "#ef4444" # Red-500
    }

def get_offset_data(daily_co2):
    """
    Calculates trees needed and offset impact.
    Formula: Trees Needed = Total CO2 / 21 (approx yearly absorption per tree)
    """
    trees_needed = daily_co2 / 21
    return {
        "daily_co2": daily_co2,
        "trees_to_offset": math.ceil(trees_needed),
        "offset_impact_percent": 100 if daily_co2 == 0 else min(100, round((0.06 / daily_co2) * 100, 1))
    }

def calculate_streak(records):
    """
    Calculates consecutive low-emission days (< 15kg).
    Assumes records is a list of SQLAlchemy objects with footprint and date.
    """
    if not records:
        return 0
    
    # Sort records by date descending
    sorted_records = sorted(records, key=lambda x: x.created_at, reverse=True)
    
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Check if latest record is today or yesterday
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
    """
    Returns risk levels for different categories based on latest record.
    """
    risks = []
    if not latest_record: 
        return risks
    
    # Transport Risks
    if latest_record.transport_km > 50:
        risks.append({"category": "Transport", "level": "High", "color": "#ef4444", "msg": "Transport footprint is critical."})
    elif latest_record.transport_km > 20:
        risks.append({"category": "Transport", "level": "Moderate", "color": "#fbbf24", "msg": "Transport usage is above average."})
    else:
        risks.append({"category": "Transport", "level": "Low", "color": "#10b981", "msg": "Transport efficiency is optimal."})

    # Energy Risks
    if latest_record.electricity_kwh > 20:
        risks.append({"category": "Energy", "level": "High", "color": "#ef4444", "msg": "Power consumption vector is high."})
    elif latest_record.electricity_kwh > 10:
        risks.append({"category": "Energy", "level": "Moderate", "color": "#fbbf24", "msg": "Moderate energy load detected."})
    else:
        risks.append({"category": "Energy", "level": "Low", "color": "#10b981", "msg": "Energy usage is within green limits."})

    return risks
