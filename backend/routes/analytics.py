from flask import Blueprint, request, jsonify
from extensions import db
from models import EmissionRecord, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import calendar
import sqlalchemy as sa
from calculator import get_carbon_classification

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
    from routes.emissions import get_dashboard
    return get_dashboard()


@analytics_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Returns top-10 users ranked by sustainability score."""
    current_user_id = int(get_jwt_identity())

    # Aggregate avg CO2 per user from emission records
    results = (
        db.session.query(
            EmissionRecord.user_id,
            sa.func.avg(EmissionRecord.total_co2).label('avg_co2'),
            sa.func.count(EmissionRecord.id).label('record_count'),
        )
        .group_by(EmissionRecord.user_id)
        .all()
    )

    BADGES = [
        ('Eco Champion', 80),
        ('Green Leader', 60),
        ('Low Impact',   40),
        ('Eco Beginner',  0),
    ]

    def badge_for(score):
        for label, threshold in BADGES:
            if score >= threshold:
                return label
        return 'Eco Beginner'

    board = []
    for row in results:
        user = User.query.get(row.user_id)
        if not user:
            continue
        avg = row.avg_co2 or 0
        score = max(0, round(100 - avg * 2))
        display = user.username or (user.name.split()[0] if user.name else f'User#{user.id}')
        board.append({
            'user_id':  user.id,
            'username': display,
            'score':    score,
            'badge':    badge_for(score),
            'is_me':    user.id == current_user_id,
        })

    board.sort(key=lambda x: x['score'], reverse=True)
    for i, entry in enumerate(board[:10], start=1):
        entry['rank'] = i

    return jsonify(board[:10]), 200
