# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.UserSignupView.as_view(), name='user_signup'),
    path('login/', views.UserLoginView.as_view(), name='user_login'),
    path('admin/login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('admin/approve/', views.UserApprovalView.as_view(), name='user_approve'),
    path('approve/', views.CheckApprovalStatusView.as_view(), name='check_approval'),
    path('update-status/', views.UpdateUserStatusView.as_view(), name='update-status'),
    path('user-list/', views.UserListView.as_view(), name='user_list'),
    path('delete-user/<int:user_id>/', views.DeleteUserView.as_view(), name='delete-user'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),  
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),  
  
]
