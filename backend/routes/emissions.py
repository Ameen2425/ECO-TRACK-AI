from flask import Blueprint, request, jsonify
from extensions import db
from models import EmissionRecord
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from calculator import (
    calculate_co2, get_breakdown, get_sustainability_score, get_carbon_classification,
    get_offset_data, calculate_streak, get_risk_indicators,
    get_weekly_stats, get_monthly_stats, get_highest_category, get_sustainability_profile
)
from ai_engine import get_eco_suggestions, predict_future_emissions

emissions_bp = Blueprint('emissions', __name__)


def _record_to_dict(r):
    return {
        "id":               r.id,
        "total_co2":        r.total_co2,
        "transport_km":     r.transport_km,
        "transport_type":   r.transport_type,
        "vehicle_brand":    r.vehicle_brand,
        "vehicle_model":    r.vehicle_model,
        "vehicle_year":     r.vehicle_year,
        "fuel_detail":      r.fuel_detail,
        "vehicle_age_years":r.vehicle_age_years,
        "age_multiplier":   r.age_multiplier,
        "base_factor":      r.base_factor,
        "driving_condition": r.driving_condition,
        "actual_mileage":   r.actual_mileage,
        "ref_mileage":      r.ref_mileage,
        "electricity_kwh":  r.electricity_kwh,
        "ac_hours":         r.ac_hours,
        "house_size":       r.house_size,
        "gas_usage":        r.gas_usage,
        "cooking_fuel":     r.cooking_fuel,
        "cooking_frequency":r.cooking_frequency,
        "waste_kg":         r.waste_kg,
        "waste_type":       r.waste_type,
        "recycling_habit":  r.recycling_habit,
        "composting":       r.composting,
        "diet_type":        r.diet_type,
        "meal_frequency":   r.meal_frequency,
        "dairy_level":      r.dairy_level,
        "family_size":      r.family_size,
        "entry_mode":       r.entry_mode,
        "created_at":       r.created_at.isoformat(),
    }


@emissions_bp.route('/add', methods=['POST'])
@emissions_bp.route('/sync', methods=['POST'])
@jwt_required()
def add_emission():
    data = request.get_json()
    user_id = get_jwt_identity()

    total_co2   = calculate_co2(data)
    breakdown   = get_breakdown(data)
    age_mult    = breakdown['transport']['age_multiplier']

    new_record = EmissionRecord(
        user_id          = int(user_id),
        # transport
        transport_km     = data.get('transport_km', 0),
        transport_type   = data.get('transport_type'),
        vehicle_brand    = data.get('vehicle_brand'),
        vehicle_model    = data.get('vehicle_model'),
        vehicle_year     = data.get('vehicle_year'),
        fuel_detail      = data.get('fuel_detail'),
        vehicle_age_years= int(data.get('vehicle_age_years') or 0),
        age_multiplier   = age_mult,
        base_factor      = data.get('base_factor', 0.0),
        driving_condition= data.get('driving_condition', 'mixed'),
        actual_mileage   = float(data.get('actual_mileage') or 0.0),
        ref_mileage      = float(data.get('ref_mileage') or 0.0),
        # electricity
        electricity_kwh  = data.get('electricity_kwh', 0),
        ac_hours         = data.get('ac_hours', 0),
        house_size       = data.get('house_size'),
        geyser_usage     = bool(data.get('geyser_usage', False)),
        has_refrigerator = bool(data.get('has_refrigerator', True)),
        # gas
        gas_usage        = data.get('gas_usage', 0),
        cooking_fuel     = data.get('cooking_fuel'),
        cooking_frequency= data.get('cooking_frequency'),
        # waste
        waste_kg         = data.get('waste_kg', 0),
        waste_type       = data.get('waste_type'),
        recycling_habit  = data.get('recycling_habit'),
        composting       = bool(data.get('composting', False)),
        # diet
        diet_type        = data.get('diet_type') or data.get('food_type'),
        meal_frequency   = data.get('meal_frequency'),
        dairy_level      = data.get('dairy_level'),
        # meta
        family_size      = data.get('family_size'),
        entry_mode       = data.get('entry_mode', 'detailed'),
        total_co2        = total_co2,
    )
    db.session.add(new_record)
    db.session.commit()

    offset_data = get_offset_data(total_co2)

    return jsonify({
        "msg":           "Record added",
        "total_co2":     total_co2,
        "score":         get_sustainability_score(total_co2),
        "trees_to_offset": offset_data['trees_to_offset'],
        "breakdown":     breakdown,
    }), 201


@emissions_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).order_by(EmissionRecord.created_at.desc()).all()

    if not records:
        return jsonify({"msg": "No records found", "stats": {}, "suggestions": []}), 200

    latest_record   = records[0]
    suggestions     = get_eco_suggestions({
        'transport_km':   latest_record.transport_km,
        'food_type':      latest_record.diet_type,
        'electricity_kwh':latest_record.electricity_kwh,
        'waste_kg':       latest_record.waste_kg,
    })

    prediction      = predict_future_emissions(records)
    total_footprint = sum(r.total_co2 for r in records)
    avg_footprint   = total_footprint / len(records)

    classification  = get_carbon_classification(latest_record.total_co2)
    offset_data     = get_offset_data(latest_record.total_co2)
    streak          = calculate_streak(records)
    risks           = get_risk_indicators(latest_record)
    weekly          = get_weekly_stats(records)
    monthly         = get_monthly_stats(records)
    highest_cat     = get_highest_category(records)
    profile_type    = get_sustainability_profile(avg_footprint)
    score           = get_sustainability_score(avg_footprint)

    return jsonify({
        "latest": {
            "footprint": latest_record.total_co2,
            "date":      latest_record.created_at.isoformat(),
        },
        "stats": {
            "total_all_time": round(total_footprint, 2),
            "daily_avg":      round(avg_footprint, 2),
            "prediction":     prediction,
            "score":          score,
            "profile_type":   profile_type,
            "highest_category": highest_cat,
        },
        "weekly":  weekly,
        "monthly": monthly,
        "intelligence": {
            "classification": classification,
            "offset": offset_data,
            "streak": streak,
            "risks":  risks,
        },
        "history": [{"date": r.created_at.isoformat(), "footprint": r.total_co2} for r in records[:30]],
        "suggestions": suggestions,
    }), 200


@emissions_bp.route('/history', methods=['GET'])
@emissions_bp.route('/records', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).order_by(EmissionRecord.created_at.desc()).all()
    return jsonify([_record_to_dict(r) for r in records]), 200


@emissions_bp.route('/weekly-stats', methods=['GET'])
@jwt_required()
def get_weekly():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).all()
    return jsonify(get_weekly_stats(records)), 200


@emissions_bp.route('/monthly-stats', methods=['GET'])
@jwt_required()
def get_monthly():
    user_id = get_jwt_identity()
    records = EmissionRecord.query.filter_by(user_id=int(user_id)).all()
    return jsonify(get_monthly_stats(records)), 200


@emissions_bp.route('/update/<int:record_id>', methods=['PUT'])
@emissions_bp.route('/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_emission(record_id):
    user_id = get_jwt_identity()
    record  = EmissionRecord.query.filter_by(id=record_id, user_id=int(user_id)).first()
    if not record:
        return jsonify({"msg": "Record not found"}), 404

    data = request.get_json()
    fields = [
        'transport_km','transport_type','vehicle_brand','vehicle_model','vehicle_year',
        'fuel_detail','vehicle_age_years','base_factor',
        'driving_condition','actual_mileage','ref_mileage',
        'electricity_kwh','ac_hours','house_size',
        'gas_usage','cooking_fuel','cooking_frequency',
        'waste_kg','waste_type','recycling_habit','composting',
        'diet_type','meal_frequency','dairy_level',
        'family_size','entry_mode',
    ]
    for f in fields:
        if f in data:
            setattr(record, f, data[f])

    record.total_co2 = calculate_co2(data)
    db.session.commit()
    return jsonify({"msg": "Record updated", "total_co2": record.total_co2}), 200


@emissions_bp.route('/delete/<int:record_id>', methods=['DELETE'])
@emissions_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_emission(record_id):
    user_id = get_jwt_identity()
    record  = EmissionRecord.query.filter_by(id=record_id, user_id=int(user_id)).first()
    if not record:
        return jsonify({"msg": "Record not found"}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"msg": "Record deleted"}), 200
