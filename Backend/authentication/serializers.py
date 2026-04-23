# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from rest_framework import serializers
from .models import UserAuth

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer pour hydrater l'application mobile avec les données du profil utilisateur.
    """
    class Meta:
        model = UserAuth
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'age', 
            'sports_interests', 
            'role', 
            'organization_id', 
            'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']
