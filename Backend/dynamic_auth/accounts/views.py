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
            password=make_password(password),
            status='pending'  # Default status is 'pending'
        )

        return Response({'message': 'Registration successful. Awaiting admin approval.'})
    
class UserApprovalView(APIView):
    permission_classes = [IsAuthenticated]  # Only admins can access this view

    def post(self, request):
        if not request.user.is_staff:  # Ensure the user is an admin
            return Response({'error': 'Unauthorized'}, status=403)

        user_id = request.data.get('user_id')
        action = request.data.get('action')  # Either 'approve' or 'reject'

        if not user_id or action not in ['approve', 'reject']:
            return Response({'error': 'Invalid request'}, status=400)

        try:
            user = CustomUser.objects.get(id=user_id)
            user.status = 'approved' if action == 'approve' else 'rejected'
            user.save()
            return Response({'message': f'User has been {user.status}.'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
class CheckApprovalStatusView(APIView):
    permission_classes = [AllowAny]  # Public endpoint

    def get(self, request):
        email = request.query_params.get('email')

        if not email:
            return Response({'error': 'Email is required.'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            return Response({'status': user.status})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=400)

        user = authenticate(email=email, password=password)

        if user is not None:
            if user.status != 'approved':
                return Response({'error': 'Your account is not approved yet.'}, status=403)

            token, created = Token.objects.get_or_create(user=user)
            
            # Include user details in the response
            return Response({
                'message': 'Login successful',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'full_name': user.full_name,
                    'email': user.email,
                }
            })

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
    

