import datetime
import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, send_from_directory
from extensions import db, bcrypt
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    contact = data.get('contact') or data.get('identifier')
    name = data.get('name', '').strip()
    username = data.get('username', '').strip() or (name.split()[0] if name else '')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([contact, name, password]):
        return jsonify({"msg": "Missing required fields"}), 400

    if password != confirm_password:
        return jsonify({"msg": "Passwords do not match"}), 400

    if len(password) < 8:
        return jsonify({"msg": "Password must be at least 8 characters"}), 400

    email = contact if '@' in contact else None
    phone = contact if not email else None

    if email and User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400
    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"msg": "Phone already registered"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        name=name,
        username=username,
        email=email,
        phone=phone,
        password_hash=hashed_pw,
        verified=True
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Account created successfully"}), 201


# Disabled OTP routes
@auth_bp.route('/send-otp', methods=['POST'])
@auth_bp.route('/verify-otp', methods=['POST'])
def disabled_otp():
    return jsonify({"msg": "OTP verification is currently disabled"}), 403


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier') or data.get('contact') or data.get('email')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({"msg": "Identifier and password required"}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.phone == identifier) | (User.username == identifier) | (User.name == identifier)
    ).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=datetime.timedelta(days=1)
        )
        display_username = user.username or (user.name.split()[0] if user.name else 'Agent')
        return jsonify(
            access_token=access_token,
            user={
                "id": user.id,
                "name": user.name,
                "username": display_username,
                "email": user.email or user.phone,
            }
        ), 200

    return jsonify({"msg": "Invalid credentials"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    display_username = user.username or (user.name.split()[0] if user.name else 'Agent')

    return jsonify({
        "id": user.id,
        "name": user.name,
        "username": display_username,
        "email": user.email,
        "phone": user.phone,
        "profile_image": user.profile_image,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }), 200


@auth_bp.route('/profile/update', methods=['PUT', 'PATCH'])
@auth_bp.route('/profile', methods=['PATCH', 'PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name'].strip()
    if 'username' in data:
        user.username = data['username'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    
    if 'email' in data:
        new_email = data['email'].strip()
        if new_email and new_email != user.email:
            existing = User.query.filter(User.email == new_email, User.id != user_id).first()
            if existing:
                return jsonify({"msg": "Email already in use"}), 400
            user.email = new_email
            
    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            return jsonify({"msg": "Password must be at least 8 characters"}), 400
        user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    db.session.commit()
    return jsonify({"msg": "Profile updated successfully", "user": {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "phone": user.phone
    }}), 200


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/upload-image', methods=['POST'])
@auth_bp.route('/profile/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
            
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Save relative path or URL
        user.profile_image = f"/api/auth/uploads/{filename}"
        db.session.commit()
        
        return jsonify({
            "msg": "Image uploaded successfully",
            "profile_image": user.profile_image
        }), 200
    
    return jsonify({"msg": "File type not allowed"}), 400

@auth_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.abspath('uploads'), filename)
