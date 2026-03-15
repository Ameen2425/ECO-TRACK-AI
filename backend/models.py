from extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)          # Full Name
    username = db.Column(db.String(80), nullable=True)       # Display Name (leaderboard)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    emissions = db.relationship('EmissionRecord', backref='user', lazy=True)

class OTPRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contact = db.Column(db.String(120), nullable=False) # email or phone
    otp_code = db.Column(db.String(6), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EmissionRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    transport_km = db.Column(db.Float, default=0.0)
    transport_type = db.Column(db.String(50)) # petrol, diesel, electric, bus, bike, walk
    electricity_kwh = db.Column(db.Float, default=0.0)
    diet_type = db.Column(db.String(50)) # Vegan, Vegetarian, Non-Vegetarian
    gas_usage = db.Column(db.Float, default=0.0)
    waste_kg = db.Column(db.Float, default=0.0)
    total_co2 = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50))
    target_value = db.Column(db.Float, nullable=False)
    current_progress = db.Column(db.Float, default=0.0)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sustainability_score = db.Column(db.Float, default=0.0)
    badge = db.Column(db.String(50), default='Eco Beginner')
