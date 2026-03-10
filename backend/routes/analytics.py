from flask import Blueprint, request, jsonify
from extensions import db
from models import EmissionRecord, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import calendar
import sqlalchemy as sa

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/', methods=['GET'])
@jwt_required()
def get_analytics():
    user_id = int(get_jwt_identity())
    records = EmissionRecord.query.filter_by(user_id=user_id).order_by(EmissionRecord.created_at.asc()).all()
    
    breakdown = {
        "transport": round(sum(r.total_co2 for r in records if r.transport_km > 0), 2),
        "energy": round(sum(r.total_co2 for r in records if (r.electricity_kwh > 0 or r.gas_usage > 0)), 2),
        "diet": round(sum(r.total_co2 for r in records if r.diet_type is not None), 2),
        "waste": round(sum(r.total_co2 for r in records if r.waste_kg > 0), 2)
    }
    
    return jsonify({
        "category_breakdown": breakdown,
        "comparison_data": [{
            "date": r.created_at.strftime("%Y-%m-%d"),
            "user": r.total_co2
        } for r in records[-30:]]
    }), 200

@analytics_bp.route('/heatmap', methods=['GET'])
@jwt_required()
def get_heatmap():
    user_id = int(get_jwt_identity())
    today = datetime.utcnow().date()
    # Start of the current month
    start_of_month = datetime(today.year, today.month, 1)
    
    records = EmissionRecord.query.filter(
        EmissionRecord.user_id == user_id,
        EmissionRecord.created_at >= start_of_month
    ).all()
    
    heatmap_data = []
    # Use dictionary for O(1) lookup: date -> total_co2 (summed per day if multiple)
    from collections import defaultdict
    daily_totals = defaultdict(float)
    for r in records:
        daily_totals[r.created_at.date()] += r.total_co2
    
    _, last_day = calendar.monthrange(today.year, today.month)
    
    for day in range(1, last_day + 1):
        current_date = today.replace(day=day)
        footprint = daily_totals.get(current_date, 0)
        
        if footprint > 0:
            intensity = 'green' if footprint < 10 else 'yellow' if footprint < 20 else 'red'
        else:
            intensity = 'green'
            
        heatmap_data.append({
            "date": current_date.isoformat(),
            "footprint": round(footprint, 2),
            "intensity": intensity
        })
        
    return jsonify({
        "month": today.strftime("%B %Y"),
        "data": heatmap_data
    }), 200

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Calling the main dashboard logic from emissions.py if needed, 
    # but the UI calls /api/dashboard directly which is aliased in app.py
    from routes.emissions import get_dashboard
    return get_dashboard()
