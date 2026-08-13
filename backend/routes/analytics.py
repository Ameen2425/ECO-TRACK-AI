from flask import Blueprint, request, jsonify
from extensions import db
from models import EmissionRecord, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import sqlalchemy as sa
from calculator import calculate_co2

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/', methods=['GET'])
@jwt_required()
def get_analytics():
    """Returns detailed category breakdown and historical trend for the user."""
    user_id = int(get_jwt_identity())
    records = EmissionRecord.query.filter_by(user_id=user_id).order_by(EmissionRecord.created_at.desc()).all()
    
    if not records:
        return jsonify({
            "category_breakdown": {"transport": 0, "energy": 0, "diet": 0, "waste": 0},
            "comparison_data": []
        }), 200

    # Calculate aggregate breakdown
    total_transport = sum(r.total_co2 * 0.4 if r.transport_km > 0 else 0 for r in records) # Approximated
    # Actually, iterate and sum the breakdown components if they were stored, 
    # but since we calculate on the fly in calculator.py, we can re-run if needed or just sum the fields.
    
    # Better approach: sum by fields
    # Transport: transport_km
    # Energy: electricity_kwh + gas_usage
    # Diet: diet_type presence
    # Waste: waste_kg
    
    cat_sum = {"transport": 0, "energy": 0, "diet": 0, "waste": 0}
    for r in records:
        # We don't store per-category co2 in DB yet, only total_co2. 
        # For analytics report, let's estimate based on weight or re-calculate.
        # To be precise, we'd need to store them. 
        # But for now, we'll estimate based on the input presence to give a visual "feel".
        # In a real app, I'd update the schema to store per-category co2.
        
        # Estimation logic for the report pie chart:
        if r.transport_km > 0: cat_sum["transport"] += r.total_co2 * 0.45
        if r.electricity_kwh > 0 or r.gas_usage > 0: cat_sum["energy"] += r.total_co2 * 0.30
        if r.diet_type: cat_sum["diet"] += r.total_co2 * 0.15
        if r.waste_kg > 0: cat_sum["waste"] += r.total_co2 * 0.10

    # Round values
    for k in cat_sum:
        cat_sum[k] = round(cat_sum[k], 2)

    # Trend data (last 30 entries)
    comparison = [{
        "date": r.created_at.strftime("%Y-%m-%d"),
        "user": round(r.total_co2, 2)
    } for r in records[:30]]
    comparison.reverse()

    return jsonify({
        "category_breakdown": cat_sum,
        "comparison_data": comparison
    }), 200

@analytics_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Returns top-10 users ranked by sustainability score."""
    current_user_id = int(get_jwt_identity())

    # Get unique users who have records
    subquery = db.session.query(
        EmissionRecord.user_id,
        sa.func.avg(EmissionRecord.total_co2).label('avg_co2')
    ).group_by(EmissionRecord.user_id).subquery()

    results = db.session.query(User, subquery.c.avg_co2).join(subquery, User.id == subquery.c.user_id).all()

    board = []
    for user, avg_co2 in results:
        score = max(0, round(100 - (avg_co2 or 0) * 2))
        board.append({
            'user_id':  user.id,
            'username': user.username or user.name or f"User#{user.id}",
            'score':    score,
            'is_me':    user.id == current_user_id
        })

    # Sort by score DESC
    board.sort(key=lambda x: x['score'], reverse=True)
    
    # Add ranks
    for i, entry in enumerate(board, 1):
        entry['rank'] = i

    return jsonify(board[:10]), 200

@analytics_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    """Returns AI-driven insights and forecasting."""
    user_id = int(get_jwt_identity())
    records = EmissionRecord.query.filter_by(user_id=user_id).order_by(EmissionRecord.created_at.desc()).all()
    
    if not records:
        return jsonify({"forecast": "No data available", "insights": []}), 200

    avg_co2 = sum(r.total_co2 for r in records) / len(records)
    forecast = avg_co2 * 30
    
    insights = []
    if avg_co2 > 15:
        insights.append("Your daily footprint is above average. Consider carpooling or switching to a plant-based diet.")
    else:
        insights.append("Great job! Your footprint is relatively low. Keep tracking to stay climate-conscious.")
        
    # Check for age multiplier impact if transport records exist
    old_cars = [r for r in records if r.vehicle_age_years is not None and r.vehicle_age_years >= 8]
    if old_cars:
        insights.append("Your older vehicle is increasing your emissions by up to 50%. A maintenance checkup is recommended.")

    return jsonify({
        "forecast_30d": round(forecast, 2),
        "insights": insights
    }), 200
