from flask import Blueprint, request, jsonify
from extensions import db
from models import UserSettings
from flask_jwt_extended import jwt_required, get_jwt_identity

settings_bp = Blueprint('settings', __name__)


def _get_or_create_settings(user_id):
    s = UserSettings.query.filter_by(user_id=user_id).first()
    if not s:
        s = UserSettings(user_id=user_id)
        db.session.add(s)
        db.session.commit()
    return s


@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())
    s = _get_or_create_settings(user_id)
    return jsonify({
        "daily_reminder":      s.daily_reminder,
        "weekly_summary":      s.weekly_summary,
        "goal_reminder":       s.goal_reminder,
        "reminder_frequency":  s.reminder_frequency,
        "animations_enabled":  s.animations_enabled,
    }), 200


@settings_bp.route('/', methods=['PUT', 'PATCH'])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    s    = _get_or_create_settings(user_id)
    data = request.get_json()

    if 'daily_reminder'     in data: s.daily_reminder     = bool(data['daily_reminder'])
    if 'weekly_summary'     in data: s.weekly_summary     = bool(data['weekly_summary'])
    if 'goal_reminder'      in data: s.goal_reminder      = bool(data['goal_reminder'])
    if 'reminder_frequency' in data: s.reminder_frequency = data['reminder_frequency']
    if 'animations_enabled' in data: s.animations_enabled = bool(data['animations_enabled'])

    db.session.commit()
    return jsonify({"msg": "Settings saved"}), 200
