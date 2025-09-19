# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    html = """
    <h1>Bienvenue sur l'API CDA Backend !</h1>
    <ul>
        <li><a href="sports/">sports/</a></li>
        <li><a href="equipments/">equipments/</a></li>
        <li><a href="geojson/">geojson/</a></li>
        <li><a href="installations/">installations/</a></li>
        <li><a href="auth/">auth/</a></li>
        <li><a href="signalements/">signalements/</a></li>
    </ul>
    <p>URL de base : <b>https://cdabackend-production.up.railway.app</b></p>
    """
    return HttpResponse(html)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('installations.urls')),
    path('auth/', include('authentication.urls')),
    path('signalements/', include('signalements.urls')),  # ← AJOUTER CETTE LIGNE
    path('', home),
]