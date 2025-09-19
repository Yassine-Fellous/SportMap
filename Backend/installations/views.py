# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .models import Installation
from .serializers import InstallationSerializer, SportsListSerializer
from django.core.cache import cache
import json
import ast

# ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import create_engine, Float
# from .models import Base, Installation  # Changed from 'from models' to 'from .models'
# from django.conf import settings

# Initialize SQLAlchemy engine and session
# engine = create_engine(settings.DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@csrf_exempt
def get_equipments(request):
    """API avec cache - GAIN ÉNORME"""
    
    # Cache pendant 5 minutes
    cache_key = "equipments_all"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        # 🚀 INSTANTANÉ - 50ms au lieu de 3 secondes
        return JsonResponse(cached_data, safe=False)
    
    # Seulement si pas en cache
    try:
        bounds = request.GET.get('bounds')
        types = request.GET.get('types')
        
        # Commencer avec tous les équipements
        query = Installation.objects.all()

        # Filtrage par bounds géographiques
        if bounds:
            sw_lng, sw_lat, ne_lng, ne_lat = map(float, bounds.split(','))
            # Django JSONField query pour PostgreSQL
            query = query.extra(
                where=[
                    "CAST(coordonnees->>'lon' AS FLOAT) >= %s",
                    "CAST(coordonnees->>'lon' AS FLOAT) <= %s", 
                    "CAST(coordonnees->>'lat' AS FLOAT) >= %s",
                    "CAST(coordonnees->>'lat' AS FLOAT) <= %s"
                ],
                params=[sw_lng, ne_lng, sw_lat, ne_lat]
            )

        # Filtrage par types d'équipements
        if types:
            types_list = types.split(',')
            query = query.filter(equip_type_name__in=types_list)

        # Convertir en dictionnaire
        #Post serialization des équipements avec des serializers
        #equipments = query.values(
        #    'id', 'inst_numero', 'coordonnees', 'inst_nom', 
        #    'equip_type_name', 'equip_type_famille', 'equip_aps_nom',
        #    'equip_acc_libre', 'equip_url', 'inst_adresse', 
        #    'inst_cp', 'equip_prop_nom', 'equip_gest_type', 
        #    'inst_acc_handi_bool'
        #)
        serializer = InstallationSerializer(query, many=True)
        data = serializer.data
        
        # Stocker en cache
        cache.set(cache_key, data, 300)  # 5 minutes
        
        return JsonResponse(data, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    # ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
    # db = SessionLocal()
    # try:
    #     bounds = request.GET.get('bounds')
    #     types = request.GET.get('types')
    #     query = db.query(Installation)

    #     if bounds:
    #         sw_lng, sw_lat, ne_lng, ne_lat = map(float, bounds.split(','))
    #         query = query.filter(
    #             Installation.coordonnees["lon"].astext.cast(Float) >= sw_lng,
    #             Installation.coordonnees["lon"].astext.cast(Float) <= ne_lng,
    #             Installation.coordonnees["lat"].astext.cast(Float) >= sw_lat,
    #             Installation.coordonnees["lat"].astext.cast(Float) <= ne_lat,
    #         )

    #     if types:
    #         types_list = types.split(',')
    #         query = query.filter(Installation.equip_type_name.in_(types_list))

    #     equipments = query.all()
    #     result = [{
    #         'id': eq.id,
    #         'inst_numero': eq.inst_numero,
    #         'coordonnees': eq.coordonnees,
    #         'inst_nom': eq.inst_nom,
    #         'equip_type_name': eq.equip_type_name,
    #         'equip_type_famille': eq.equip_type_famille,
    #         'equip_aps_nom': eq.equip_aps_nom,
    #         'equip_acc_libre': eq.equip_acc_libre,
    #         'equip_url': eq.equip_url,
    #         'inst_adresse': eq.inst_adresse,
    #         'inst_cp': eq.inst_cp,
    #         'equip_prop_nom': eq.equip_prop_nom,
    #         'equip_gest_type': eq.equip_gest_type,
    #         'inst_acc_handi_bool': eq.inst_acc_handi_bool
    #     } for eq in equipments]
    #     return JsonResponse(result, safe=False)
    # finally:
    #     db.close()


@csrf_exempt
def get_geojson(request):
    """Version Django ORM basée sur votre logique SQLAlchemy"""
    try:
        # Récupérer toutes les installations avec Django ORM
        installations = Installation.objects.all()
        features = []
        
        for installation in installations:
            try:
                coordonnees = installation.coordonnees
                
                # Vérification exacte comme votre code
                if not coordonnees or "lon" not in coordonnees or "lat" not in coordonnees:
                    print(f"Skipping installation {installation.inst_numero}: Invalid coordinates")
                    continue

                # Parser les sports de manière sécurisée
                sports = installation.equip_aps_nom
                if sports and isinstance(sports, str):
                    try:
                        # Si c'est une liste Python stockée comme string
                        if sports.startswith('[') and sports.endswith(']'):
                            sports = ast.literal_eval(sports)
                    except (ValueError, SyntaxError):
                        # Garder comme string si parsing échoue
                        pass

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            float(coordonnees["lon"]),
                            float(coordonnees["lat"])
                        ]
                    },
                    "properties": {
                        "id": installation.id,
                        "name": installation.inst_nom,
                        "type": installation.equip_type_name,
                        "family": installation.equip_type_famille,
                        "sports": sports,
                        "free_access": installation.equip_acc_libre,
                        "url": installation.equip_url,
                        "address": installation.inst_adresse,
                        "city": installation.inst_cp,
                        "owner": installation.equip_prop_nom,
                        "gestion": installation.equip_gest_type,
                        "inst_acc_handi_bool": installation.inst_acc_handi_bool
                    }
                }
                features.append(feature)
                
            except (KeyError, TypeError, ValueError) as e:
                print(f"Error processing installation {installation.inst_numero}: {e}")
                continue

        print(f"✅ GeoJSON generated with {len(features)} features")
        
        return JsonResponse({
            "type": "FeatureCollection",
            "features": features
        })
        
    except Exception as e:
        print(f"❌ Critical error in get_geojson: {e}")
        return JsonResponse({
            "type": "FeatureCollection",
            "features": [],
            "error": str(e)
        }, status=500)
    # ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
        #    features = []
        #
        #for eq in equipments:
        #    try:
        #        coordonnees = eq.coordonnees
        #        if not coordonnees or "lon" not in coordonnees or "lat" not in coordonnees:
        #            print(f"Skipping equipment {eq.inst_numero}: Invalid coordinates")
        #            continue
#
        #        feature = {
        #            "type": "Feature",
        #            "geometry": {
        #                "type": "Point", 
        #                "coordinates": [
        #                    float(coordonnees["lon"]),
        #                    float(coordonnees["lat"])
        #                ]
        #            },
        #            "properties": {
        #                "id": eq.inst_numero,
        #                "name": eq.inst_nom,
        #                "type": eq.equip_type_name,
        #                "family": eq.equip_type_famille,
        #                "sports": eq.equip_aps_nom,
        #                "free_access": eq.equip_acc_libre,
        #                "url": eq.equip_url,
        #                "address": eq.inst_adresse,
        #                "city": eq.inst_cp,
        #                "owner": eq.equip_prop_nom,
        #                "gestion": eq.equip_gest_type,
        #                "inst_acc_handi_bool": eq.inst_acc_handi_bool
        #            }
        #        }
        #        features.append(feature)
        #        
        #    except (KeyError, TypeError, ValueError) as e:
        #        print(f"Error processing equipment {eq.inst_numero}: {e}")
        #        continue
#
        #return JsonResponse({
        #    "type": "FeatureCollection", 
        #    "features": features
        #})

    # ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
    # db = SessionLocal()
    # try:
    #     equipments = db.query(Installation).all()
    #     features = []
    #     for eq in equipments:
    #         try:
    #             coordonnees = eq.coordonnees
    #             if not coordonnees or "lon" not in coordonnees or "lat" not in coordonnees:
    #                 print(f"Skipping equipment {eq.inst_numero}: Invalid coordinates")
    #                 continue

    #             feature = {
    #                 "type": "Feature",
    #                 "geometry": {
    #                     "type": "Point",
    #                     "coordinates": [
    #                         float(coordonnees["lon"]),
    #                         float(coordonnees["lat"])
    #                     ]
    #                 },
    #                 "properties": {
    #                     "id": eq.inst_numero,
    #                     "name": eq.inst_nom,
    #                     "type": eq.equip_type_name,
    #                     "family": eq.equip_type_famille,
    #                     "sports": eq.equip_aps_nom,
    #                     "free_access": eq.equip_acc_libre,
    #                     "url": eq.equip_url,
    #                     "address": eq.inst_adresse,
    #                     "city": eq.inst_cp,
    #                     "owner": eq.equip_prop_nom,
    #                     "gestion": eq.equip_gest_type,
    #                     "inst_acc_handi_bool": eq.inst_acc_handi_bool
    #                 }
    #             }
    #             features.append(feature)
    #         except (KeyError, TypeError, ValueError) as e:
    #             print(f"Error processing equipment {eq.inst_numero}: {e}")
    #             continue

    #     return JsonResponse({
    #         "type": "FeatureCollection",
    #         "features": features
    #     })
    # finally:
    #     db.close()

@csrf_exempt
def get_sports(request):
    """API pour récupérer la liste unique des sports - VERSION DJANGO ORM"""
    try:
        # Paramètre optionnel pour des stats détaillées
        detailed = request.GET.get('detailed', 'false').lower() == 'true'
        
        # Récupérer toutes les installations
        installations = Installation.objects.all()
        
        # Choisir le serializer selon le paramètre

        serializer = SportsListSerializer()
        # ✨ MAGIE DU SERIALIZER ✨
        data = serializer.to_representation(installations)
        return JsonResponse(data)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

#    # ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
        #    # Récupérer tous les sports (field equip_aps_nom)
        #sports_rows = Installation.objects.values_list('equip_aps_nom', flat=True)
        #unique_sports = set()
#
        #for sport_field in sports_rows:
        #    if sport_field:
        #        try:
        #            # Si c'est une liste Python stockée comme string
        #            sports_list = ast.literal_eval(sport_field)
        #            for sport in sports_list:
        #                unique_sports.add(sport.strip())
        #        except (ValueError, SyntaxError):
        #            # Si c'est juste un string simple
        #            unique_sports.add(sport_field.strip())
#
        #sorted_sports = sorted(unique_sports)
        #return JsonResponse({"sports": sorted_sports})

    # ===== ANCIEN CODE SQLALCHEMY (COMMENTÉ) =====
    # db = SessionLocal()
    # try:
    #     from sqlalchemy import distinct
    #     sports_rows = db.query(Installation.equip_aps_nom).all()
    #     unique_sports = set()

    #     for row in sports_rows:
    #         if row[0]:
    #             try:
    #                 sports_list = ast.literal_eval(row[0])
    #                 for sport in sports_list:
    #                     unique_sports.add(sport.strip())
    #             except (ValueError, SyntaxError) as e:
    #                 print(f"Error parsing sports list: {row[0]}. Error: {e}")

    #     sorted_sports = sorted(unique_sports)
    #     return JsonResponse({"sports": sorted_sports})
    # finally:
    #     db.close()

# Vue simple pour test
@csrf_exempt
def installations_list(request):
    """API simple pour lister les installations"""
    try:
        # Paramètre de limite optionnel
        limit = int(request.GET.get('limit', 10))  # Défaut: 10
        
        installations = Installation.objects.all()[:limit]
        
        # ✨ UTILISER LE SERIALIZER ✨
        serializer = InstallationSerializer(installations, many=True)
        
        return JsonResponse({
            'installations': serializer.data,
            'count': len(serializer.data),
            'limit': limit
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)