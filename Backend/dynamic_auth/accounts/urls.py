# accounts/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.UserSignupView.as_view(), name='user_signup'),
    path('login/', views.UserLoginView.as_view(), name='user_login'),
    path('admin/login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('admin/approve/', views.UserApprovalView.as_view(), name='user_approve'),
    path('approve/', views.CheckApprovalStatusView.as_view(), name='check_approval'),
  
]
