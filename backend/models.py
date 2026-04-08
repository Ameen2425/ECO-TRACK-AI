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
    settings = db.relationship('UserSettings', backref='user', uselist=False, lazy=True)

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

    # --- Transport ---
    transport_km = db.Column(db.Float, default=0.0)
    transport_type = db.Column(db.String(50))   # car, bus, bike, walk, cycle, train
    vehicle_brand = db.Column(db.String(100))  # e.g. "Honda"
    vehicle_model = db.Column(db.String(100))   # e.g. "Civic"
    vehicle_year = db.Column(db.Integer)        # e.g. 2022
    fuel_detail = db.Column(db.String(50))      # Petrol/Diesel/Electric/CNG/LPG/PNG/Induction
    vehicle_age_years = db.Column(db.Integer, default=0)  # for age multiplier
    age_multiplier = db.Column(db.Float, default=1.0)
    base_factor = db.Column(db.Float, default=0.0)
    driving_condition = db.Column(db.String(20), default='mixed') # city, highway, mixed
    actual_mileage = db.Column(db.Float, default=0.0)
    ref_mileage = db.Column(db.Float, default=0.0)

    # --- Electricity ---
    electricity_kwh = db.Column(db.Float, default=0.0)
    ac_hours = db.Column(db.Float, default=0.0)
    house_size = db.Column(db.String(20))       # Small / Medium / Large
    geyser_usage = db.Column(db.Boolean, default=False)
    has_refrigerator = db.Column(db.Boolean, default=True)

    # --- Gas / Heating ---
    gas_usage = db.Column(db.Float, default=0.0)
    cooking_fuel = db.Column(db.String(50))     # LPG / PNG / Electric / Induction
    cooking_frequency = db.Column(db.String(50)) # Once / Twice / More

    # --- Waste ---
    waste_kg = db.Column(db.Float, default=0.0)
    waste_type = db.Column(db.String(50))       # Food / Plastic / Paper / Mixed
    recycling_habit = db.Column(db.String(20))  # Always / Sometimes / Never
    composting = db.Column(db.Boolean, default=False)

    # --- Food / Diet ---
    diet_type = db.Column(db.String(50))        # Vegan / Vegetarian / Eggetarian / Non-Veg
    meal_frequency = db.Column(db.String(50))   # Never / Rarely / Weekly / Daily (meat)
    dairy_level = db.Column(db.String(20))      # Low / Medium / High

    # --- Meta ---
    family_size = db.Column(db.String(20))      # 1-2 / 3-4 / 5+
    entry_mode = db.Column(db.String(20), default='detailed')  # quick / detailed
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

class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    # Reminder preferences
    daily_reminder = db.Column(db.Boolean, default=True)
    weekly_summary = db.Column(db.Boolean, default=True)
    goal_reminder = db.Column(db.Boolean, default=True)
    reminder_frequency = db.Column(db.String(20), default='daily')  # daily/weekly/monthly
    # UI preferences
    animations_enabled = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
