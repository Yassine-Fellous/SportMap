# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.db import models
from django.utils import timezone

class RoleChoices(models.TextChoices):
    SUPER_ADMIN = 'SUPER_ADMIN', 'Super Administrateur'
    MUNICIPAL_AGENT = 'MUNICIPAL_AGENT', 'Agent Mairie'
    CLUB_MANAGER = 'CLUB_MANAGER', 'Gérant de Club Privé'
    ADVERTISER = 'ADVERTISER', 'Annonceur / Marque'
    USER = 'USER', 'Sportif (Standard)'

# Modèle pour l'authentification des utilisateurs
class UserAuth(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    sports_interests = models.JSONField(default=list, blank=True) # Liste des sports favoris
    push_token = models.CharField(max_length=255, blank=True, null=True) # Notifications push
    is_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    reset_token = models.CharField(max_length=64, blank=True, null=True)
    reset_token_created = models.DateTimeField(blank=True, null=True)
    is_admin = models.BooleanField(default=False) 
    
    # --- RBAC ---
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.USER,
        db_index=True
    )
    organization_id = models.IntegerField(null=True, blank=True) # Pour lier à une mairie/club spécifique
    
    # --- ANALYTICS ---
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'authentication_userauth'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return self.email
