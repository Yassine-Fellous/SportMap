# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.
from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from .models import UserAuth
import secrets
from datetime import timedelta, datetime
from django.conf import settings
import jwt
import json
import random
from .email_utils import send_email_via_brevo_api


@csrf_exempt
def health_check(request):
    """Vue de test pour vérifier que l'API fonctionne"""
    return JsonResponse({
        "status": "API is working",
        "method": request.method,
        "available_endpoints": [
            "/auth/register/",
            "/auth/login/", 
            "/auth/verify-code/",
            "/auth/resend-verification-code/",  # ← NOUVEAU
            "/auth/request-password-reset/",
            "/auth/reset-password/",
            "/auth/validate-reset-token/",
            "/geojson/",
            "/health/"
        ]
    })



@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")
        try:
            user = UserAuth.objects.get(email=email)
            if check_password(password, user.password):
                if not user.is_verified:
                    return JsonResponse({'error': 'Compte non validé'}, status=403)
                # Génère un JWT qui expire dans 1h
                expire = datetime.utcnow() + timedelta(hours=1)
                payload = {
                    "email": user.email,
                    "exp": expire
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
                return JsonResponse({
                    "token": token,
                    "token_expire": expire,
                    "message": "Connexion réussie"
                })
            else:
                return JsonResponse({"error": "Mot de passe incorrect"}, status=401)
        except UserAuth.DoesNotExist:
            return JsonResponse({"error": "Utilisateur non trouvé"}, status=404)
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")
            
            if not email or not password:
                return JsonResponse({"error": "Email et mot de passe requis"}, status=400)
            
            if UserAuth.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email déjà utilisé"}, status=409)
            
            code = str(random.randint(100000, 999999))
            user = UserAuth.objects.create(
                email=email,
                password=make_password(password),
                is_verified=False,
                verification_code=code
            )
            
            html_content = f"""
            <html>
              <body style="background:#f7f9fc;padding:40px;">
                <div style="max-width:400px;margin:auto;background:white;border-radius:12px;box-shadow:0 2px 8px #e3e8ee;padding:32px;">
                  <h2 style="color:#2563eb;font-family:sans-serif;">Bienvenue sur <span style="color:#0ea5e9;">SportMap</span> !</h2>
                  <p style="font-size:16px;color:#334155;font-family:sans-serif;">
                    Voici votre code de validation :
                  </p>
                  <div style="font-size:32px;font-weight:bold;color:#2563eb;background:#e0f2fe;padding:16px;border-radius:8px;text-align:center;letter-spacing:4px;">
                    {code}
                  </div>
                  <p style="margin-top:24px;font-size:14px;color:#64748b;font-family:sans-serif;">
                    <br>
                    Merci de votre inscription !
                  </p>
                </div>
              </body>
            </html>
            """
            
            # ✅ UTILISER L'API BREVO AU LIEU DE SMTP
            success, message = send_email_via_brevo_api(
                to_email=email,
                subject="Votre code de validation SportMap",
                html_content=html_content,
                text_content=f"Votre code de validation : {code}"
            )
            
            if success:
                return JsonResponse({"message": "Code envoyé par email"})
            else:
                # En cas d'échec, retourner le code pour debug
                return JsonResponse({
                    "message": "Email temporairement indisponible",
                    "debug_code": code,  # ← Pour les tests
                    "error_detail": message
                })
                
        except Exception as e:
            return JsonResponse({"error": f"Erreur serveur: {str(e)}"}, status=500)
            
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def verify_code_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        code = data.get("code")
        try:
            user = UserAuth.objects.get(email=email)
            if user.verification_code == code:
                user.is_verified = True
                user.verification_code = None
                user.save()
                return JsonResponse({'message': 'Compte validé'})
            else:
                return JsonResponse({'error': 'Code incorrect'}, status=400)
        except UserAuth.DoesNotExist:
            return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def request_password_reset(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            
            if not UserAuth.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email inconnu"}, status=404)
            
            token = secrets.token_urlsafe(32)
            user = UserAuth.objects.get(email=email)
            user.reset_token = token
            user.reset_token_created = timezone.now()
            user.save()
            
            reset_link = f"https://cdafrontend-production.up.railway.app/reset-password/{token}?email={email}"
            
            html_content = f"""
            <html>
              <body style="background:#f7f9fc;padding:40px;">
                <div style="max-width:400px;margin:auto;background:white;border-radius:12px;box-shadow:0 2px 8px #e3e8ee;padding:32px;">
                  <h2 style="color:#2563eb;font-family:sans-serif;">Réinitialisation de mot de passe</h2>
                  <p style="font-size:16px;color:#334155;font-family:sans-serif;">
                    Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :
                  </p>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="{reset_link}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">
                      Réinitialiser mon mot de passe
                    </a>
                  </div>
                  <p style="font-size:12px;color:#64748b;font-family:sans-serif;">
                    Ce lien expire dans 1 heure.
                  </p>
                </div>
              </body>
            </html>
            """
            
            # ✅ UTILISER L'API BREVO
            success, message = send_email_via_brevo_api(
                to_email=email,
                subject="Réinitialisation de votre mot de passe SportMap",
                html_content=html_content,
                text_content=f"Lien de réinitialisation: {reset_link}"
            )
            
            if success:
                return JsonResponse({"message": "Lien de réinitialisation envoyé par email"})
            else:
                return JsonResponse({"error": f"Erreur envoi email: {message}"}, status=500)
                
        except Exception as e:
            return JsonResponse({"error": f"Erreur serveur: {str(e)}"}, status=500)
            
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        token = data.get("token")
        new_password = data.get("new_password")
        try:
            user = UserAuth.objects.get(email=email, reset_token=token)
            # Vérifie l'expiration du token (1h ici)
            if not user.reset_token_created or (timezone.now() - user.reset_token_created).total_seconds() > 3600:
                return JsonResponse({"error": "Token expiré"}, status=400)
            user.password = make_password(new_password)
            user.reset_token = None
            user.reset_token_created = None
            user.save()
            return JsonResponse({"message": "Mot de passe réinitialisé"})
        except UserAuth.DoesNotExist:
            return JsonResponse({"error": "Lien invalide"}, status=400)
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def validate_reset_token(request):
    """Valider l'existence et la validité d'un token de réinitialisation"""
    if request.method == "GET":
        token = request.GET.get("token")
        email = request.GET.get("email")  # Optionnel pour plus de sécurité
        
        if not token:
            return JsonResponse({"valid": False, "error": "Token manquant"}, status=400)
        
        try:
            # Chercher par token (et email si fourni)
            if email:
                user = UserAuth.objects.get(reset_token=token, email=email)
            else:
                user = UserAuth.objects.get(reset_token=token)
            
            # Vérifier l'expiration (1h comme dans reset_password)
            if not user.reset_token_created or (timezone.now() - user.reset_token_created).total_seconds() > 3600:
                return JsonResponse({
                    "valid": False, 
                    "error": "Token expiré",
                    "expired": True
                }, status=400)
            
            # Token valide
            return JsonResponse({
                "valid": True,
                "email": user.email,  # Pour pré-remplir le formulaire
                "expires_in": int(3600 - (timezone.now() - user.reset_token_created).total_seconds())
            })
            
        except UserAuth.DoesNotExist:
            return JsonResponse({
                "valid": False, 
                "error": "Token invalide",
                "not_found": True
            }, status=404)
    
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)

@csrf_exempt
def resend_verification_code(request):
    """Renvoyer un nouveau code de validation à un utilisateur non vérifié"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            
            if not email:
                return JsonResponse({"error": "Email requis"}, status=400)
            
            # Vérifier que l'utilisateur existe et n'est pas encore vérifié
            try:
                user = UserAuth.objects.get(email=email, is_verified=False)
            except UserAuth.DoesNotExist:
                # Sécurité : ne pas révéler si l'utilisateur existe ou est déjà vérifié
                return JsonResponse({
                    "message": "Si ce compte existe et n'est pas vérifié, un nouveau code a été envoyé"
                })
            
            # Générer un nouveau code de vérification (même format que register_view)
            new_code = str(random.randint(100000, 999999))
            user.verification_code = new_code
            user.save()
            
            print(f"🔄 DEBUG - Nouveau code généré pour {email}: {new_code}")
            
            # HTML email cohérent avec le style existant
            html_content = f"""
            <html>
              <body style="background:#f7f9fc;padding:40px;">
                <div style="max-width:400px;margin:auto;background:white;border-radius:12px;box-shadow:0 2px 8px #e3e8ee;padding:32px;">
                  <h2 style="color:#2563eb;font-family:sans-serif;">Code de vérification <span style="color:#0ea5e9;">SportMap</span></h2>
                  <p style="font-size:16px;color:#334155;font-family:sans-serif;">
                    Voici votre nouveau code de vérification :
                  </p>
                  <div style="font-size:32px;font-weight:bold;color:#2563eb;background:#e0f2fe;padding:16px;border-radius:8px;text-align:center;letter-spacing:4px;">
                    {new_code}
                  </div>
                  <p style="margin-top:24px;font-size:14px;color:#64748b;font-family:sans-serif;">
                    Si vous n'avez pas demandé ce code, ignorez cet email.
                    <br>
                    L'équipe SportMap
                  </p>
                </div>
              </body>
            </html>
            """
            
            # Utiliser l'API Brevo (cohérent avec tes autres envois)
            success, message = send_email_via_brevo_api(
                to_email=email,
                subject="Nouveau code de vérification SportMap",
                html_content=html_content,
                text_content=f"Votre nouveau code de vérification SportMap : {new_code}"
            )
            
            if success:
                return JsonResponse({"message": "Nouveau code envoyé avec succès"})
            else:
                # En cas d'échec email, retourner le code pour debug (comme dans register_view)
                return JsonResponse({
                    "message": "Email temporairement indisponible",
                    "debug_code": new_code,  # ← Pour les tests
                    "error_detail": message
                })
                
        except Exception as e:
            print(f"❌ DEBUG - Erreur resend_verification_code: {str(e)}")
            return JsonResponse({"error": f"Erreur serveur: {str(e)}"}, status=500)
            
    return JsonResponse({"error": "Méthode non autorisée"}, status=405)