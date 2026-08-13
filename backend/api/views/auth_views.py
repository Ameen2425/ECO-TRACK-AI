import os
import datetime
import jwt
from django.conf import settings
from django.http import HttpResponse, FileResponse, Http404
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from api.models import User

UPLOAD_FOLDER = os.path.join(settings.BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_jwt_token(user_id):
    payload = {
        'sub': str(user_id),
        'identity': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    contact = data.get('contact') or data.get('identifier')
    name = (data.get('name') or '').strip()
    username = (data.get('username') or '').strip() or (name.split()[0] if name else '')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not all([contact, name, password]):
        return Response({"msg": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    if password != confirm_password:
        return Response({"msg": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response({"msg": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)

    email = contact if '@' in contact else None
    phone = contact if not email else None

    if email and User.objects.filter(email=email).exists():
        return Response({"msg": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    if phone and User.objects.filter(phone=phone).exists():
        return Response({"msg": "Phone already registered"}, status=status.HTTP_400_BAD_REQUEST)

    hashed_pw = make_password(password)
    new_user = User.objects.create(
        name=name,
        username=username,
        email=email,
        phone=phone,
        password_hash=hashed_pw,
        verified=True
    )
    return Response({"msg": "Account created successfully"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def disabled_otp(request):
    return Response({"msg": "OTP verification is currently disabled"}, status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    data = request.data
    identifier = data.get('identifier') or data.get('contact') or data.get('email')
    password = data.get('password')

    if not identifier or not password:
        return Response({"msg": "Identifier and password required"}, status=status.HTTP_400_BAD_REQUEST)

    users = User.objects.filter(
        models_q(email=identifier) | models_q(phone=identifier) | models_q(username=identifier) | models_q(name=identifier)
    )
    user = users.first()

    if user and check_password(password, user.password_hash):
        access_token = generate_jwt_token(user.id)
        display_username = user.username or (user.name.split()[0] if user.name else 'Agent')
        return Response({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "username": display_username,
                "email": user.email or user.phone,
            }
        }, status=status.HTTP_200_OK)

    return Response({"msg": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# Helper function for Q filters
from django.db.models import Q as models_q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    display_username = user.username or (user.name.split()[0] if user.name else 'Agent')
    return Response({
        "id": user.id,
        "name": user.name,
        "username": display_username,
        "email": user.email,
        "phone": user.phone,
        "profile_image": user.profile_image,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data

    if 'name' in data:
        user.name = data['name'].strip()
    if 'username' in data:
        user.username = data['username'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()

    if 'email' in data:
        new_email = data['email'].strip()
        if new_email and new_email != user.email:
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"msg": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            return Response({"msg": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)
        user.password_hash = make_password(data['password'])

    user.save()
    return Response({
        "msg": "Profile updated successfully",
        "user": {
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_image(request):
    user = request.user
    if 'file' not in request.FILES:
        return Response({"msg": "No file part"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    if file.name == '':
        return Response({"msg": "No selected file"}, status=status.HTTP_400_BAD_REQUEST)

    if file and allowed_file(file.name):
        filename = f"user_{user.id}_{file.name}"
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        file_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        user.profile_image = f"/api/auth/uploads/{filename}"
        user.save()

        return Response({
            "msg": "Image uploaded successfully",
            "profile_image": user.profile_image
        }, status=status.HTTP_200_OK)

    return Response({"msg": "File type not allowed"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def uploaded_file(request, filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    raise Http404("File not found")
