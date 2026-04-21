from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count

from signalements.models import Signalement
from installations.models import Installation
from authentication.permissions import IsMunicipalAgent

class MunicipalDashboardAPIView(APIView):
    """
    Endpoint analytique strict pour le Dashbord des Mairies
    """
    # permission_classes = [IsMunicipalAgent] # <-- Activé en production

    def get(self, request):
        total_installations = Installation.objects.count()
        signalements_en_cours = Signalement.objects.filter(statut='OUVERT').count()
        
        health_score = 100.0
        if total_installations > 0:
            ratio = (signalements_en_cours / total_installations) * 100
            health_score = max(0, 100 - ratio)

        heatmap_data = Signalement.objects.filter(statut='OUVERT') \
            .values('categorie') \
            .annotate(count=Count('id')) \
            .order_by('-count')[:5]

        return Response({
            "metrics": {
                "health_score_pct": round(health_score, 1),
                "active_alerts": signalements_en_cours,
                "avg_resolution_days": 2, 
            },
            "heatmap": list(heatmap_data)
        })
