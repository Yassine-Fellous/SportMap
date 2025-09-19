# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.db import models
from django.utils import timezone
from authentication.models import UserAuth
from installations.models import Installation

class Signalement(models.Model):
    # Choix d'états pour l'administration
    ETAT_CHOICES = [
        ('Nouveau', 'Nouveau'),
        ('Vérification', 'En vérification'),
        ('En maintenance', 'En maintenance'),
        ('Maintenance effectuée', 'Maintenance effectuée'),
        ('Rejeté', 'Rejeté'),
        ('Fermé', 'Fermé'),
    ]
    
    TYPE_CHOICES = [
        ('Dégradation', 'Dégradation'),
        ('Équipement cassé', 'Équipement cassé'),
        ('Problème d\'accès', 'Problème d\'accès'),
        ('Sécurité', 'Problème de sécurité'),
        ('Propreté', 'Problème de propreté'),
        ('Autre', 'Autre'),
    ]

    message = models.TextField()
    images_url = models.CharField(max_length=255, blank=True, null=True)  # Legacy
    date = models.DateTimeField(default=timezone.now)
    type = models.CharField(max_length=100, choices=TYPE_CHOICES, default='Autre')
    etat = models.CharField(max_length=100, choices=ETAT_CHOICES, default='Nouveau')
    
    # Relations
    utilisateur = models.ForeignKey(UserAuth, on_delete=models.CASCADE, related_name='signalements')
    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name='signalements')
    
    # Champs d'administration
    date_modification = models.DateTimeField(auto_now=True)
    admin_notes = models.TextField(blank=True, null=True, help_text="Notes internes pour l'administration")
    traite_par = models.ForeignKey(UserAuth, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='signalements_traites', help_text="Admin qui a traité le signalement")

    class Meta:
        db_table = 'signalements'
        verbose_name = 'Signalement'
        verbose_name_plural = 'Signalements'
        ordering = ['-date']  # Plus récents en premier

    def __str__(self):
        return f"{self.type} - {self.etat} ({self.date.date()}) - {self.installation.inst_nom}"
    
    @property
    def est_nouveau(self):
        return self.etat == 'Nouveau'
    
    @property
    def est_termine(self):
        return self.etat in ['Maintenance effectuée', 'Fermé', 'Rejeté']


