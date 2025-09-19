from django.urls import path
from . import views


urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('verify-code/', views.verify_code_view, name='verify_code'),
    path('resend-verification-code/', views.resend_verification_code, name='resend_verification_code'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('validate-reset-token/', views.validate_reset_token, name='validate_reset_token'),
]