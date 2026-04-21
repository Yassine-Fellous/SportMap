from django.urls import path
from .views import MunicipalDashboardAPIView

urlpatterns = [
    path('municipal-dashboard/', MunicipalDashboardAPIView.as_view(), name='municipal-dashboard'),
]
