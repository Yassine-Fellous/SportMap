# authentication/email_utils.py
import requests
import json
from django.conf import settings

def send_email_via_brevo_api(to_email, subject, html_content, text_content=None):
    """
    Envoie un email via l'API Brevo
    """
    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": settings.BREVO_API_KEY
    }
    
    payload = {
        "sender": {
            "name": "SportMap",
            "email": settings.DEFAULT_FROM_EMAIL
        },
        "to": [
            {
                "email": to_email,
                "name": to_email.split('@')[0]  # Utilise la partie avant @ comme nom
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }
    
    # Ajouter contenu texte si fourni
    if text_content:
        payload["textContent"] = text_content
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        return True, "Email envoyé avec succès"
    except requests.exceptions.RequestException as e:
        return False, f"Erreur envoi email: {str(e)}"