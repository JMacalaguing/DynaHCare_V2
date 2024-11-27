# accounts/views.py
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password

class UserSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        full_name = request.data.get('full_name')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')

        if not all([full_name, email, phone_number, password]):
            return Response({'error': 'All fields are required.'}, status=400)

        user = CustomUser.objects.create(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            password=make_password(password)
        )

        token, created = Token.objects.get_or_create(user=user)

        return Response({'message': 'User created successfully', 'token': token.key})

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        user = authenticate(email=email, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'message': 'Login successful', 'token': token.key})

        return Response({'error': 'Invalid credentials'}, status=401)

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        user = authenticate(email=email, password=password)

        if user is not None and user.is_staff:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'message': 'Admin login successful', 'token': token.key})

        return Response({'error': 'Invalid credentials or not an admin'}, status=401)
    

