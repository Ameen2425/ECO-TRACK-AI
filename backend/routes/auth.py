from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({"msg": "Missing required fields"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1))
        return jsonify(access_token=access_token, user={"username": user.username, "email": user.email}), 200
    return jsonify({"msg": "Invalid credentials"}), 401
