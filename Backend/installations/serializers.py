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
    inst_cp = serializers.SerializerMethodField()

    class Meta:
        model = Installation
        fields = [
            'id', 'inst_numero', 'coordonnees', 'inst_nom', 
            'equip_type_name', 'equip_type_famille', 'equip_aps_nom',
            'equip_acc_libre', 'equip_url', 'inst_adresse', 
            'inst_cp', 'equip_prop_nom', 'equip_gest_type', 
            'inst_acc_handi_bool'
        ]

    def get_inst_cp(self, obj):
        """Conversion du Code INSEE (ex: 13201) en Code Postal (13001) pour l'affichage (PLM)"""
        cp = obj.inst_cp
        if cp and isinstance(cp, str) and len(cp) == 5:
            # Marseille (132XX -> 130XX)
            if cp.startswith('132'):
                return cp.replace('132', '130', 1)
            # Lyon (693XX -> 690XX)
            elif cp.startswith('693'):
                return cp.replace('693', '690', 1)
            # Paris (751XX -> 750XX)
            elif cp.startswith('751'):
                return cp.replace('751', '750', 1)
        return cp

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