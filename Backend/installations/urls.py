# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.urls import path
from . import views

app_name = 'installations'

urlpatterns = [
    path('equipments/', views.get_equipments, name='get_equipments'),
    path('geojson/', views.get_geojson, name='get_geojson'),
    path('sports/', views.get_sports, name='get_sports'),
    path('installations/', views.installations_list, name='installations_list'),
]


    #path('api/equipments/', views.get_equipments, name='get_equipments'),
    #path('api/geojson/', views.get_geojson, name='get_geojson'),
    #path('api/sports/', views.get_sports, name='get_sports'),