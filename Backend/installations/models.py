# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

# AVANT (SQLAlchemy)
# from sqlalchemy import Column, String, Integer, Boolean, JSON
# from sqlalchemy.ext.declarative import declarative_base
# Base = declarative_base()

#Base = declarative_base()
#
#class Installation(Base):
#    __tablename__ = "installations"
#    id = Column(Integer, primary_key=True)
#    inst_numero = Column(String)
#    coordonnees = Column(JSON)
#    inst_nom = Column(String)
#    equip_type_name = Column(String)
#    equip_type_famille = Column(String)
#    equip_aps_nom = Column(String)
#    equip_acc_libre = Column(Boolean)
#    equip_url = Column(String)
#    inst_adresse = Column(String)
#    inst_cp = Column(String)
#    equip_prop_nom = Column(String)
#    equip_gest_type = Column(String)
#    inst_acc_handi_bool = Column(Boolean)

# APRÈS (Django ORM)

from django.db import models

#class Installation(models.Model):
#    # Clé primaire automatique (Django ajoute 'id' automatiquement)
#    inst_numero = models.CharField(max_length=50, blank=True, null=True)
#    coordonnees = models.JSONField()
#    inst_nom = models.CharField(max_length=200)
#    equip_type_name = models.CharField(max_length=100, blank=True, null=True)
#    equip_type_famille = models.CharField(max_length=100, blank=True, null=True)
#    equip_aps_nom = models.CharField(max_length=200, blank=True, null=True)
#    equip_acc_libre = models.BooleanField(default=False)
#    equip_url = models.URLField(max_length=500, blank=True, null=True)
#    inst_adresse = models.TextField(blank=True, null=True)
#    inst_cp = models.CharField(max_length=10, blank=True, null=True)
#    equip_prop_nom = models.CharField(max_length=100, blank=True, null=True)
#    equip_gest_type = models.CharField(max_length=100, blank=True, null=True)
#    inst_acc_handi_bool = models.BooleanField(default=False)
    # Vos 13 propriétés avec tailles augmentées
class Installation(models.Model):
    # TOUT EN TextField = ILLIMITÉ !
    inst_numero = models.TextField(blank=True, null=True)      # ♾️ ILLIMITÉ
    coordonnees = models.JSONField()
    inst_nom = models.TextField(blank=True, null=True)         # ♾️ ILLIMITÉ
    equip_type_name = models.TextField(blank=True, null=True)  # ♾️ ILLIMITÉ
    equip_type_famille = models.TextField(blank=True, null=True) # ♾️ ILLIMITÉ
    equip_aps_nom = models.TextField(blank=True, null=True)    # ♾️ ILLIMITÉ
    equip_acc_libre = models.BooleanField(default=False)
    equip_url = models.TextField(blank=True, null=True)        # ♾️ ILLIMITÉ
    inst_adresse = models.TextField(blank=True, null=True)     # ♾️ ILLIMITÉ
    inst_cp = models.TextField(blank=True, null=True)          # ♾️ ILLIMITÉ
    equip_prop_nom = models.TextField(blank=True, null=True)   # ♾️ ILLIMITÉ
    equip_gest_type = models.TextField(blank=True, null=True)  # ♾️ ILLIMITÉ
    inst_acc_handi_bool = models.BooleanField(default=False)

    class Meta:
        db_table = 'installations'
        verbose_name = 'Installation Sportive'
        verbose_name_plural = 'Installations Sportives'
        
    def __str__(self):
        return f"{self.inst_nom} - {self.equip_type_name}"