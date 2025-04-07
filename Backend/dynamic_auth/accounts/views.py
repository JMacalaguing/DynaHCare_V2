# accounts/views.py
import random
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.serializers import CustomUserSerializer
from dynamic_auth import settings
from .models import CustomUser, PasswordResetCode
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail

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

class UpdateUserStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        status = request.data.get("status")

        if status not in dict(CustomUser.STATUS_CHOICES).keys():
            return Response({"error": "Invalid status"}, status=400)

        user = get_object_or_404(CustomUser, id=user_id)
        user.status = status
        user.save()

        return Response({"message": f"User status updated to {status}"})
    
class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Filter users who are not staff
        users = CustomUser.objects.filter(is_staff=False)
        serializer = CustomUserSerializer(users, many=True)
        return Response({"users": serializer.data})

class DeleteUserView(APIView):
    permission_classes = [AllowAny]
    
    def delete(self, request, user_id):
        try:
            # Attempt to retrieve the user by ID
            user = CustomUser.objects.get(id=user_id)
            
            # Delete the user
            user.delete()
            return Response("User deleted successfully")

        except CustomUser.DoesNotExist:
            # Handle case where the user does not exist
            return Response("User not found")
        except Exception as e:
            # Catch any other errors and log them
            print(f"Error deleting user: {e}")  # For debugging purposes
            return Response("Internal server error")
        
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            reset_code_value = str(random.randint(100000, 999999))
            reset_code = PasswordResetCode.objects.create(user=user, code=reset_code_value)

            send_mail(
                subject="Password Reset Request",
                message=f"Your password reset code is: {reset_code.code}", 
                from_email='hello@demomailtrap.com',
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"message": "Reset code sent to email."})
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=404)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response({"error": "All fields are required."}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
            reset_code = PasswordResetCode.objects.get(user=user, code=code)

            if not reset_code.is_valid():
                return Response({"error": "Reset code expired."}, status=400)

            # Update password
            user.password = make_password(new_password)
            user.save()
            reset_code.delete()  # Invalidate the reset code

            return Response({"message": "Password reset successful."})
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid email or reset code."}, status=404)
        except PasswordResetCode.DoesNotExist:
            return Response({"error": "Invalid reset code."}, status=404)