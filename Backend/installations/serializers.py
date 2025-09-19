# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from rest_framework import serializers
from .models import Installation
import ast
# Serializer pour l'Installation
# selectionnne les champs nécessaires
# et transforme les données pour l'API
class InstallationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installation
        fields = [
            'id', 'inst_numero', 'coordonnees', 'inst_nom', 
            'equip_type_name', 'equip_type_famille', 'equip_aps_nom',
            'equip_acc_libre', 'equip_url', 'inst_adresse', 
            'inst_cp', 'equip_prop_nom', 'equip_gest_type', 
            'inst_acc_handi_bool'
        ]

class SportsListSerializer(serializers.Serializer):
    """Serializer pour extraire et formatter la liste des sports"""
    
    def to_representation(self, queryset):
        """Extraire tous les sports uniques du QuerySet"""
        unique_sports = set()
        
        for installation in queryset:
            if installation.equip_aps_nom:
                sports = self._parse_sports_field(installation.equip_aps_nom)
                unique_sports.update(sports)
        
        return {
            "sports": sorted(list(unique_sports)),
            "total_count": len(unique_sports)
        }
    
    def _parse_sports_field(self, sport_field):
        """Parser un champ sport (string ou liste)"""
        if not sport_field:
            return []
        
        try:
            # Cas 1: Liste Python stockée comme string "['Tennis', 'Volley']"
            if sport_field.startswith('[') and sport_field.endswith(']'):
                sports_list = ast.literal_eval(sport_field)
                return [sport.strip() for sport in sports_list if sport.strip()]
            
            # Cas 2: String simple "Tennis de table"
            else:
                return [sport_field.strip()]
                
        except (ValueError, SyntaxError):
            # En cas d'erreur, traiter comme string simple
            return [sport_field.strip()] if sport_field.strip() else []
        
        
class InstallationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des installations"""
    
    class Meta:
        model = Installation
        fields = [
            'id', 'inst_nom', 'equip_type_name', 
            'inst_adresse', 'coordonnees'
        ]
    
    def to_representation(self, instance):
        """Optimiser la représentation pour la liste"""
        data = super().to_representation(instance)
        
        # Simplifier les coordonnées pour l'affichage liste
        coords = data.get('coordonnees')
        if coords and isinstance(coords, dict):
            try:
                data['coordonnees'] = {
                    'lon': round(float(coords['lon']), 4),
                    'lat': round(float(coords['lat']), 4)
                }
            except (KeyError, ValueError, TypeError):
                data['coordonnees'] = None
        
        return data