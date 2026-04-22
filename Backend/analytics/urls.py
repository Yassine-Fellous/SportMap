from django.urls import path
from .views import (
    MunicipalDashboardAPIView, 
    ClubDashboardAPIView, 
    AdvertiserDashboardAPIView, 
    SuperAdminDashboardAPIView
)

urlpatterns = [
    path('municipal-dashboard/', MunicipalDashboardAPIView.as_view(), name='municipal-dashboard'),
    path('club-dashboard/', ClubDashboardAPIView.as_view(), name='club-dashboard'),
    path('advertiser-dashboard/', AdvertiserDashboardAPIView.as_view(), name='advertiser-dashboard'),
    path('superadmin-dashboard/', SuperAdminDashboardAPIView.as_view(), name='superadmin-dashboard'),
]
