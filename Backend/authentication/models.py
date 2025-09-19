# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.db import models
from django.utils import timezone

# Modèle pour l'authentification des utilisateurs
class UserAuth(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    is_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, blank=True, null=True)  # Stocke le hash, pas le mot de passe en clair
    reset_token = models.CharField(max_length=64, blank=True, null=True)
    reset_token_created = models.DateTimeField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)  # ← NOUVEAU

    class Meta:
        db_table = 'authentication_userauth'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
    
    def __str__(self):
        return self.email