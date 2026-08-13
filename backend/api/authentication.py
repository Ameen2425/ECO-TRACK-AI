import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from api.models import User

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('sub') or payload.get('identity')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token missing user identity')

        try:
            user = User.objects.get(pk=int(user_id))
        except (User.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
