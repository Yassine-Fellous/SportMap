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
        signalements_en_cours = Signalement.objects.filter(etat__in=etats_actifs).count()
        
        health_score = 100.0
        if total_installations > 0:
            ratio = (signalements_en_cours / total_installations) * 100
            health_score = max(0, 100 - ratio)

        # Vraie donnée de localisation : Les terrains les plus dégradés (Hitmap dégradations)
        heatmap_degradations = Signalement.objects.filter(etat__in=etats_actifs) \
            .values('installation__inst_nom', 'installation__coordonnees') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:5]

        # Vraie donnée de localisation : Les terrains les plus fréquentés (Heatmap fréquentations)
        heatmap_frequentation = UserCheckIn.objects.all() \
            .values('installation__inst_nom', 'installation__coordonnees') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:5]

        return Response({
            "metrics": {
                "health_score_pct": round(health_score, 1),
                "active_alerts": signalements_en_cours,
                "avg_resolution_days": 2.0, 
            },
            "heatmap_degradations": list(heatmap_degradations),
            "heatmap_frequentation": list(heatmap_frequentation)
        })

class ClubDashboardAPIView(APIView):
    """
    Endpoint analytique pour le Gérant de Club Privé
    """
    permission_classes = [IsClubManager] 

    def get(self, request):
        # Simulation des données de réservation en attendant qu'on crée le module "Booking"
        return Response({
            "metrics": {
                "occupancy_rate_pct": 78.5,
                "monthly_revenue_eur": 12450.00,
                "active_members": 342
            },
            "funnel": {
                "views": 4500,
                "clicks": 1200,
                "bookings": 450,
                "conversion_pct": 10.0
            }
        })

class AdvertiserDashboardAPIView(APIView):
    """
    Endpoint analytique pour les Annonceurs
    """
    permission_classes = [IsAdvertiser] 

    def get(self, request):
        # Simulation métriques publicitaires
        return Response({
            "metrics": {
                "total_impressions": 125430,
                "ctr_pct": 4.2,
                "drive_to_store_conversions": 85
            },
            "campaigns": [
                {"name": "Promo Raquettes Décathlon", "impressions": 80000, "clicks": 3200},
                {"name": "Gourde gratuite", "impressions": 45430, "clicks": 2067}
            ]
        })

class SuperAdminDashboardAPIView(APIView):
    """
    Endpoint analytique global pour le Super Administrateur / Fondateur KORTA
    Agrège les VRAIES données des utilisateurs.
    """
    permission_classes = [IsSuperAdmin] 

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        yesterday = now - timezone.timedelta(days=1)

        total_users = UserAuth.objects.count()
        total_installations = Installation.objects.count()
        
        # VRAI CALCÜL : Monthly Active Users & Daily Active Users
        mau = UserAuth.objects.filter(last_login__gte=thirty_days_ago).count()
        dau = UserAuth.objects.filter(last_login__gte=yesterday).count()
        
        # VRAI CALCÜL de Rétention : Utilisateurs inscrits il y a +30j qui se sont co les 30 derniers jours
        old_users_count = UserAuth.objects.filter(date_joined__lt=thirty_days_ago).count()
        if old_users_count > 0:
            retained_users = UserAuth.objects.filter(
                date_joined__lt=thirty_days_ago, 
                last_login__gte=thirty_days_ago
            ).count()
            retention_rate_pct = round((retained_users / old_users_count) * 100, 1)
        else:
            retention_rate_pct = 0.0

        # Le MRR reste en simulation tant que Stripe/Banque n'est pas intégré
        return Response({
            "metrics": {
                "total_users": total_users,
                "total_installations": total_installations,
                "mau": mau,
                "dau": dau,
                "retention_rate_pct": retention_rate_pct,
                "mrr_eur": 32500.00 
            }
        })
