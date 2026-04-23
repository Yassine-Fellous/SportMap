from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, F, Avg, ExpressionWrapper, fields
from django.utils import timezone

from signalements.models import Signalement
from installations.models import Installation, UserCheckIn
from authentication.models import UserAuth
from authentication.permissions import IsMunicipalAgent, IsClubManager, IsAdvertiser, IsSuperAdmin

class MunicipalDashboardAPIView(APIView):
    """
    Endpoint analytique pour le Dashboard des Mairies
    Agrège les VRAIES données de fréquentation (Check-ins) et les dégradations (Signalements).
    """
    permission_classes = [IsMunicipalAgent] 

    def get(self, request):
        total_installations = Installation.objects.count()
        etats_actifs = ['Nouveau', 'En vérification', 'En maintenance']
        
        # TOUTES LES ALERTES ACTIVES POUR LA LISTE CLIQUABLE
        alertes_actives_qs = Signalement.objects.filter(etat__in=etats_actifs).select_related('installation')
        signalements_en_cours = alertes_actives_qs.count()
        
        alertes_list = list(alertes_actives_qs.values(
            'id', 'type', 'etat', 'date', 'installation__inst_nom'
        ).order_by('-date')[:20]) # On limite à 20 pour la liste rapide
        
        health_score = 100.0
        if total_installations > 0:
            ratio = (signalements_en_cours / total_installations) * 100
            health_score = max(0, 100 - ratio)

        # HEATMAP DÉGRADATIONS (TOP 10 + toutes les lat/lng)
        heatmap_degradations = Signalement.objects.filter(etat__in=etats_actifs) \
            .values('installation__inst_nom', 'installation__coordonnees') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:50] # Top 50 pour la carte

        # HEATMAP FRÉQUENTATION (TOP 10 + toutes les lat/lng)
        heatmap_frequentation = UserCheckIn.objects.all() \
            .values('installation__inst_nom', 'installation__coordonnees') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:50] # Top 50 pour la carte

        return Response({
            "metrics": {
                "health_score_pct": round(health_score, 1),
                "active_alerts": signalements_en_cours,
                "avg_resolution_days": 2.0, 
            },
            "alertes_list": alertes_list,
            "heatmap_degradations": list(heatmap_degradations),
            "heatmap_frequentation": list(heatmap_frequentation)
        })

class ClubDashboardAPIView(APIView):
    permission_classes = [IsClubManager] 
    def get(self, request):
        return Response({
            "metrics": {"occupancy_rate_pct": 78.5, "monthly_revenue_eur": 12450.00, "active_members": 342},
            "funnel": {"views": 4500, "clicks": 1200, "bookings": 450, "conversion_pct": 10.0}
        })

class AdvertiserDashboardAPIView(APIView):
    permission_classes = [IsAdvertiser] 
    def get(self, request):
        return Response({
            "metrics": {"total_impressions": 125430, "ctr_pct": 4.2, "drive_to_store_conversions": 85},
            "campaigns": [{"name": "Promo Raquettes Décathlon", "impressions": 80000, "clicks": 3200}, {"name": "Gourde gratuite", "impressions": 45430, "clicks": 2067}]
        })

class SuperAdminDashboardAPIView(APIView):
    permission_classes = [IsSuperAdmin] 
    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        yesterday = now - timezone.timedelta(days=1)
        total_users = UserAuth.objects.count()
        total_installations = Installation.objects.count()
        mau = UserAuth.objects.filter(last_login__gte=thirty_days_ago).count()
        dau = UserAuth.objects.filter(last_login__gte=yesterday).count()
        old_users_count = UserAuth.objects.filter(date_joined__lt=thirty_days_ago).count()
        if old_users_count > 0:
            retained_users = UserAuth.objects.filter(date_joined__lt=thirty_days_ago, last_login__gte=thirty_days_ago).count()
            retention_rate_pct = round((retained_users / old_users_count) * 100, 1)
        else:
            retention_rate_pct = 0.0
        return Response({
            "metrics": {
                "total_users": total_users, "total_installations": total_installations,
                "mau": mau, "dau": dau, "retention_rate_pct": retention_rate_pct, "mrr_eur": 32500.00 
            }
        })
