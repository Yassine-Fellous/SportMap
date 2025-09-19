# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
import jwt
import json

from .models import Signalement
from authentication.models import UserAuth
from installations.models import Installation

def get_user_from_jwt(request):
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email = payload.get('email')
        return UserAuth.objects.get(email=email)
    except Exception:
        return None

@csrf_exempt
def create_signalement(request):
    print(f"🔍 DEBUG - Requête reçue: {request.method}")
    
    if request.method != "POST":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)

    user = get_user_from_jwt(request)
    if not user:
        return JsonResponse({"error": "Authentification requise"}, status=401)

    try:
        data = json.loads(request.body)
        installation_id = data.get("installation_id")  # Reçoit ID auto-incrémenté (ex: 47)
        message = data.get("message")
        images_url = data.get("images_url")
        type_ = data.get("type", "Autre")

        print(f"🔍 DEBUG - installation_id reçu: {installation_id} (type: {type(installation_id)})")

        if not installation_id and installation_id != 0:
            return JsonResponse({"error": "installation_id et message requis"}, status=400)
        
        if not message:
            return JsonResponse({"error": "installation_id et message requis"}, status=400)

        # ✅ CHERCHER DIRECTEMENT PAR ID DJANGO AUTO-INCRÉMENTÉ
        try:
            print(f"🔍 DEBUG - Recherche par ID Django: {installation_id}")
            
            # Ton frontend envoie maintenant l'ID Django (ex: 47)
            installation = Installation.objects.get(id=installation_id)
            
            print(f"✅ DEBUG - Installation trouvée:")
            print(f"    - ID Django: {installation.id}")
            print(f"    - inst_numero: {installation.inst_numero}")
            print(f"    - Nom: {installation.inst_nom}")
                
        except Installation.DoesNotExist:
            print(f"❌ DEBUG - Installation non trouvée avec ID: {installation_id}")
            return JsonResponse({"error": "Installation introuvable"}, status=404)
        except ValueError:
            print(f"❌ DEBUG - ID invalide: {installation_id}")
            return JsonResponse({"error": "ID d'installation invalide"}, status=400)

        # Créer le signalement avec l'ID Django (foreign key)
        signalement = Signalement.objects.create(
            message=message,
            images_url=images_url,
            type=type_,
            utilisateur=user,
            installation=installation,  # Django utilise automatiquement installation.id
            date=timezone.now()
        )
        
        print(f"✅ DEBUG - Signalement créé:")
        print(f"    - Signalement ID: {signalement.id}")
        print(f"    - Installation FK: {signalement.installation.id}")
        
        return JsonResponse({
            "message": "Signalement créé", 
            "id": signalement.id,
            "installation": {
                "id": installation.id,
                "inst_numero": installation.inst_numero,
                "nom": installation.inst_nom
            }
        })
        
    except Exception as e:
        print(f"❌ DEBUG - Erreur: {str(e)}")
        import traceback
        print(f"❌ DEBUG - Traceback: {traceback.format_exc()}")
        return JsonResponse({"error": str(e)}, status=500)

# ===== FONCTIONS UTILITAIRES =====
def get_admin_user_from_jwt(request):
    """Vérifier si l'utilisateur est admin"""
    user = get_user_from_jwt(request)
    if not user:
        return None
    
    # Vérifier si l'utilisateur est admin (tu peux adapter cette logique)
    if not hasattr(user, 'is_admin') or not user.is_admin:
        return None
    
    return user

def require_admin(view_func):
    """Décorateur pour exiger les droits admin"""
    def wrapper(request, *args, **kwargs):
        admin_user = get_admin_user_from_jwt(request)
        if not admin_user:
            return JsonResponse({"error": "Accès admin requis"}, status=403)
        return view_func(request, admin_user, *args, **kwargs)
    return wrapper

# ===== ROUTES D'ADMINISTRATION =====

@csrf_exempt
@require_admin
def admin_list_signalements(request, admin_user):
    """Liste tous les signalements pour l'administration"""
    if request.method != "GET":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    
    try:
        # Paramètres de filtrage
        etat = request.GET.get('etat')
        type_signalement = request.GET.get('type')
        utilisateur_id = request.GET.get('utilisateur_id')
        installation_id = request.GET.get('installation_id')
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        
        # Construction de la requête
        query = Signalement.objects.select_related('utilisateur', 'installation', 'traite_par')
        
        # Filtres
        if etat:
            query = query.filter(etat=etat)
        if type_signalement:
            query = query.filter(type=type_signalement)
        if utilisateur_id:
            query = query.filter(utilisateur_id=utilisateur_id)
        if installation_id:
            query = query.filter(installation_id=installation_id)
        
        # Pagination
        total_count = query.count()
        signalements = query[offset:offset + limit]
        
        # Formatage des données
        data = []
        for signalement in signalements:
            data.append({
                "id": signalement.id,
                "message": signalement.message,
                "type": signalement.type,
                "etat": signalement.etat,
                "date": signalement.date.isoformat(),
                "date_modification": signalement.date_modification.isoformat(),
                "images_urls": signalement.images_urls,
                "admin_notes": signalement.admin_notes,
                "utilisateur": {
                    "id": signalement.utilisateur.id,
                    "email": signalement.utilisateur.email,
                    "nom": getattr(signalement.utilisateur, 'nom', 'N/A'),
                    "prenom": getattr(signalement.utilisateur, 'prenom', 'N/A'),
                },
                "installation": {
                    "id": signalement.installation.id,
                    "inst_numero": signalement.installation.inst_numero,
                    "nom": signalement.installation.inst_nom,
                    "adresse": signalement.installation.inst_adresse,
                    "type": signalement.installation.equip_type_name,
                },
                "traite_par": {
                    "id": signalement.traite_par.id,
                    "email": signalement.traite_par.email
                } if signalement.traite_par else None
            })
        
        return JsonResponse({
            "signalements": data,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_next": offset + limit < total_count
            },
            "stats": {
                "nouveau": Signalement.objects.filter(etat='Nouveau').count(),
                "verification": Signalement.objects.filter(etat='Vérification').count(),
                "en_maintenance": Signalement.objects.filter(etat='En maintenance').count(),
                "termine": Signalement.objects.filter(etat__in=['Maintenance effectuée', 'Fermé']).count(),
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_list_signalements: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_admin
def admin_update_signalement(request, admin_user, signalement_id):
    """Mettre à jour l'état d'un signalement"""
    if request.method != "PUT":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    
    try:
        data = json.loads(request.body)
        nouvel_etat = data.get('etat')
        admin_notes = data.get('admin_notes', '')
        
        # Validation de l'état
        etats_valides = [choice[0] for choice in Signalement.ETAT_CHOICES]
        if nouvel_etat not in etats_valides:
            return JsonResponse({"error": f"État invalide. États valides: {etats_valides}"}, status=400)
        
        # Récupérer le signalement
        try:
            signalement = Signalement.objects.get(id=signalement_id)
        except Signalement.DoesNotExist:
            return JsonResponse({"error": "Signalement introuvable"}, status=404)
        
        # Sauvegarder l'ancien état pour logs
        ancien_etat = signalement.etat
        
        # Mettre à jour
        signalement.etat = nouvel_etat
        signalement.admin_notes = admin_notes
        signalement.traite_par = admin_user
        signalement.save()
        
        print(f"✅ Admin {admin_user.email} a changé le signalement {signalement_id}: {ancien_etat} → {nouvel_etat}")
        
        return JsonResponse({
            "message": "Signalement mis à jour",
            "signalement": {
                "id": signalement.id,
                "ancien_etat": ancien_etat,
                "nouvel_etat": nouvel_etat,
                "admin_notes": admin_notes,
                "traite_par": admin_user.email,
                "date_modification": signalement.date_modification.isoformat()
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_update_signalement: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_admin
def admin_delete_signalement(request, admin_user, signalement_id):
    """Supprimer un signalement"""
    if request.method != "DELETE":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    
    try:
        # Récupérer le signalement
        try:
            signalement = Signalement.objects.get(id=signalement_id)
        except Signalement.DoesNotExist:
            return JsonResponse({"error": "Signalement introuvable"}, status=404)
        
        # Sauvegarder les infos pour logs
        signalement_info = {
            "id": signalement.id,
            "type": signalement.type,
            "utilisateur": signalement.utilisateur.email,
            "installation": signalement.installation.inst_nom,
            "date": signalement.date.isoformat()
        }
        
        # Supprimer
        signalement.delete()
        
        print(f"🗑️ Admin {admin_user.email} a supprimé le signalement {signalement_id}")
        
        return JsonResponse({
            "message": "Signalement supprimé",
            "signalement_supprime": signalement_info,
            "supprime_par": admin_user.email
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_delete_signalement: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_admin
def admin_stats_signalements(request, admin_user):
    """Statistiques détaillées pour l'administration"""
    if request.method != "GET":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    
    try:
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        # Stats par état
        stats_par_etat = {}
        for etat, _ in Signalement.ETAT_CHOICES:
            stats_par_etat[etat] = Signalement.objects.filter(etat=etat).count()
        
        # Stats par type
        stats_par_type = {}
        for type_sig, _ in Signalement.TYPE_CHOICES:
            stats_par_type[type_sig] = Signalement.objects.filter(type=type_sig).count()
        
        # Stats temporelles
        aujourd_hui = timezone.now().date()
        hier = aujourd_hui - timedelta(days=1)
        cette_semaine = aujourd_hui - timedelta(days=7)
        ce_mois = aujourd_hui - timedelta(days=30)
        
        stats_temporelles = {
            "aujourd_hui": Signalement.objects.filter(date__date=aujourd_hui).count(),
            "hier": Signalement.objects.filter(date__date=hier).count(),
            "cette_semaine": Signalement.objects.filter(date__date__gte=cette_semaine).count(),
            "ce_mois": Signalement.objects.filter(date__date__gte=ce_mois).count(),
            "total": Signalement.objects.count()
        }
        
        # Top utilisateurs signaleurs
        top_utilisateurs = Signalement.objects.values(
            'utilisateur__email', 'utilisateur__id'
        ).annotate(
            nb_signalements=Count('id')
        ).order_by('-nb_signalements')[:10]
        
        # Top installations signalées
        top_installations = Signalement.objects.values(
            'installation__inst_nom', 'installation__id', 'installation__inst_numero'
        ).annotate(
            nb_signalements=Count('id')
        ).order_by('-nb_signalements')[:10]
        
        return JsonResponse({
            "stats_par_etat": stats_par_etat,
            "stats_par_type": stats_par_type,
            "stats_temporelles": stats_temporelles,
            "top_utilisateurs": list(top_utilisateurs),
            "top_installations": list(top_installations)
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_stats_signalements: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_admin
def admin_list_utilisateurs(request, admin_user):
    """Liste des utilisateurs avec leurs signalements"""
    if request.method != "GET":
        return JsonResponse({"error": "Méthode non autorisée"}, status=405)
    
    try:
        from django.db.models import Count
        
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        
        # Récupérer les utilisateurs avec le nombre de signalements
        utilisateurs = UserAuth.objects.annotate(
            nb_signalements=Count('signalements')
        ).order_by('-nb_signalements')[offset:offset + limit]
        
        total_count = UserAuth.objects.count()
        
        data = []
        for user in utilisateurs:
            # Récupérer les derniers signalements de l'utilisateur
            derniers_signalements = Signalement.objects.filter(
                utilisateur=user
            ).order_by('-date')[:5].values(
                'id', 'type', 'etat', 'date', 'installation__inst_nom'
            )
            
            data.append({
                "id": user.id,
                "email": user.email,
                "nom": getattr(user, 'nom', 'N/A'),
                "prenom": getattr(user, 'prenom', 'N/A'),
                "is_verified": user.is_verified,
                "date_inscription": user.created_at.isoformat() if hasattr(user, 'created_at') else None,
                "nb_signalements": user.nb_signalements,
                "derniers_signalements": list(derniers_signalements)
            })
        
        return JsonResponse({
            "utilisateurs": data,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_next": offset + limit < total_count
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur admin_list_utilisateurs: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
