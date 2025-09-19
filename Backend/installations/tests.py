# Copyright (c) 2025
# Yassine Fellous, Abdelkader Sofiane Ziri, Mathieu Duverne, Mohamed Marwane Bellagha
# Tous droits réservés. Utilisation interdite sans autorisation écrite des auteurs.

from django.test import TestCase, Client
from .models import Installation

class InstallationModelTest(TestCase):
    """Tests basiques du modèle"""
    
    def setUp(self):
        self.installation_data = {
            'inst_numero': 'TEST001',
            'coordonnees': {'lon': 5.4, 'lat': 43.3},
            'inst_nom': 'Stade Test',
            'equip_type_name': 'Terrain de football',
            'equip_acc_libre': True,
            'inst_adresse': '1 rue Test',
            'inst_cp': '13000'
        }
    
    def test_create_installation(self):
        """Test création d'une installation"""
        installation = Installation.objects.create(**self.installation_data)
        self.assertEqual(installation.inst_nom, 'Stade Test')
        self.assertEqual(installation.coordonnees['lon'], 5.4)

class InstallationAPITest(TestCase):
    """Tests basiques des API"""
    
    def setUp(self):
        # Créer 2 installations de test
        Installation.objects.create(
            inst_numero='TEST001',
            coordonnees={'lon': 5.4, 'lat': 43.3},
            inst_nom='Test 1',
            equip_type_name='Terrain de football',
            equip_acc_libre=True
        )
        Installation.objects.create(
            inst_numero='TEST002',
            coordonnees={'lon': 5.5, 'lat': 43.4},
            inst_nom='Test 2',
            equip_type_name='Terrain de tennis',
            equip_acc_libre=False
        )
    
    def test_equipments_endpoint(self):
        """Test endpoint équipements"""
        response = self.client.get('/api/v1/equipments/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
    
    def test_geojson_endpoint(self):
        """Test endpoint GeoJSON"""
        response = self.client.get('/api/v1/geojson/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['type'], 'FeatureCollection')
    
    def test_sports_endpoint(self):
        """Test endpoint sports"""
        response = self.client.get('/api/v1/sports/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('sports', data)