from flask import Blueprint, request, jsonify
from extensions import db
from models import EmissionRecord
from flask_jwt_extended import jwt_required, get_jwt_identity
from calculator import (
    calculate_co2, get_sustainability_score, get_carbon_classification,
    get_offset_data, calculate_streak, get_risk_indicators
)
from ai_engine import get_eco_suggestions, predict_future_emissions

emissions_bp = Blueprint('emissions', __name__)

# Emission Factors (kg CO2 per unit)
FACTORS = {
    "transport": {
        "petrol": 0.12,
        "diesel": 0.15,
        "electric": 0.05,
        "bus": 0.08,
        "bike": 0.0,
        "walk": 0.0
    },
    "electricity": 0.82, # kg CO2/kWh
    "gas": 2.0, # kg CO2/kg
    "waste": 0.5, # kg CO2/kg
    "diet": {
        "Vegan": 1.5,
        "Vegetarian": 2.5,
        "Non-Vegetarian": 5.0
    }
}

@emissions_bp.route('/add', methods=['POST'])
@emissions_bp.route('/sync', methods=['POST'])
@jwt_required()
def add_emission():
    data = request.get_json()
    user_id = get_jwt_identity()

    total_co2 = calculate_co2(data)

    new_record = EmissionRecord(
        user_id=int(user_id),
        transport_km=data.get('transport_km', 0),
        transport_type=data.get('transport_type'),
        electricity_kwh=data.get('electricity_kwh', 0),
        diet_type=data.get('diet_type') or data.get('food_type'),
        gas_usage=data.get('gas_usage', 0),
        waste_kg=data.get('waste_kg', 0),
        total_co2=total_co2
    )

    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        "msg": "Record added",
        "total_co2": total_co2,
        "score": get_sustainability_score(total_co2)
    }), 201

@emissions_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).order_by(EmissionRecord.created_at.desc()).all()
    
    if not records:
        return jsonify({"msg": "No records found", "stats": {}, "suggestions": []}), 200
    
    latest_record = records[0]
    suggestions = get_eco_suggestions({
        'transport_km': latest_record.transport_km,
        'food_type': latest_record.diet_type,
        'electricity_kwh': latest_record.electricity_kwh,
        'waste_kg': latest_record.waste_kg
    })
    
    prediction = predict_future_emissions(records)
    
    total_footprint = sum(r.total_co2 for r in records)
    avg_footprint = total_footprint / len(records)
    
    classification = get_carbon_classification(latest_record.total_co2)
    offset_data = get_offset_data(latest_record.total_co2)
    streak = calculate_streak(records)
    risks = get_risk_indicators(latest_record)
    
    return jsonify({
        "latest": {
            "footprint": latest_record.total_co2,
            "date": latest_record.created_at.isoformat()
        },
        "stats": {
            "total_all_time": round(total_footprint, 2),
            "daily_avg": round(avg_footprint, 2),
            "prediction": prediction
        },
        "intelligence": {
            "classification": classification,
            "offset": offset_data,
            "streak": streak,
            "risks": risks
        },
        "history": [{
            "date": r.created_at.isoformat(),
            "footprint": r.total_co2
        } for r in records[:7]],
        "suggestions": suggestions
    }), 200

@emissions_bp.route('/history', methods=['GET'])
@emissions_bp.route('/records', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).order_by(EmissionRecord.created_at.desc()).all()
    return jsonify([{
        "id": r.id,
        "total_co2": r.total_co2,
        "created_at": r.created_at.isoformat()
    } for r in records]), 200
