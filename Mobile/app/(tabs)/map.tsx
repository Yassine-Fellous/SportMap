import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Keyboard, Switch, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
// Note: Le bundle @rnmapbox/maps nécessite un build natif (development build), Expo Go ne fonctionnera pas
import MapboxGL from '@rnmapbox/maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';

// Configuration Globale Mapbox : Fournir le public token d'accès
// IMPÉRATIF : Cela doit être appelé avant le rendu du moindre composant MapboxGL.MapView
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

// Fonction pour récupérer les données GeoJSON depuis le backend Django local
const fetchSportsFacilities = async () => {
  // L'URL proviendra de ton fichier Mobile/.env
  // Attention à bien avoir remplacé 192.168.X.X par ton IP.
  // D'après ton config/urls.py l'url de l'API est sous /geojson/
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/geojson/`);
  
  if (!response.ok) {
    throw new Error(`Erreur réseau HTTP : ${response.status}`);
  }
  return response.json();
};

export default function MapScreen() {
  // Détection du Dark Mode du système (iOS/Android)
  const colorScheme = useColorScheme();
  // State pour forcer le thème
  const [themeOverride, setThemeOverride] = useState<'system' | 'dark' | 'light'>('system');
  const isDark = themeOverride === 'system' ? colorScheme === 'dark' : themeOverride === 'dark';

  // Couleurs dynamiques selon le thème (Light / Dark)
  const theme = useMemo(() => ({
    mapStyle: isDark ? 'mapbox://styles/mapbox/navigation-night-v1' : MapboxGL.StyleURL.Street,
    bg: isDark ? '#1e272e' : '#ffffff',
    surface: isDark ? '#2d3436' : '#ffffff',
    textMain: isDark ? '#f5f6fa' : '#2d3436',
    textSub: isDark ? '#b2bec3' : '#636e72',
    iconColor: isDark ? '#dfe6e9' : '#444444',
    border: isDark ? '#444444' : '#f1f2f6',
    chipBg: isDark ? '#353b48' : '#f1f2f6',
    loader: isDark ? '#51bbd6' : '#51bbd6',
  }), [isDark]);

  // Références pour manipuler les BottomSheets
  const bottomSheetRef = useRef<BottomSheet>(null); // Pour les détails du terrain
  const menuSheetRef = useRef<BottomSheet>(null);   // Pour le menu principal
  const filtersSheetRef = useRef<BottomSheet>(null); // Pour le panneau des filtres

  // State pour stocker les informations de l'équipement sélectionné
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  // States pour la recherche et les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5);

  // Catégories (sports ou familles) populaires
  const categories = useMemo(() => [
    { id: 'football', label: 'Football', match: 'foot' },
    { id: 'tennis', label: 'Tennis', match: 'tennis' },
    { id: 'boules', label: 'Boulodrome', match: 'pétanque' },
    { id: 'natation', label: 'Piscine', match: 'natation' },
    { id: 'basket', label: 'Basket', match: 'basket' },
    { id: 'fitness', label: 'Fitness/Muscu', match: 'forme' }
  ], []);

  // Vue zoom de la caméra
  const cameraRef = useRef<MapboxGL.Camera>(null);

  // States pour la localisation
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  // Ref pour le ShapeSource (pour manipuler les clusters)
  const shapeSourceRef = useRef<MapboxGL.ShapeSource>(null);

  // Demander les permissions de localisation au démarrage
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation([location.coords.longitude, location.coords.latitude]);
      }
    })();
  }, []);

  // Fonction pour centrer la carte sur l'utilisateur
  const centerOnUser = useCallback(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [userLocation]);

  // Requête TanStack Query pour charger le geoJSON de ton backend
  const { data: geoJsonData, isLoading, isError, error } = useQuery({
    queryKey: ['sportsFacilities'],
    queryFn: fetchSportsFacilities,
  });

  // Filtrage du geoJsonData selon la barre de recherche et la catégorie
  const filteredGeoJson = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) return null;

    let features = geoJsonData.features;

    // Filtre par texte (nom, commune, type)
    if (searchQuery.trim().length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      features = features.filter((feat: any) => {
        const props = feat.properties;
        return (
          (props.name && props.name.toLowerCase().includes(lowerQuery)) ||
          (props.city && props.city.toLowerCase().includes(lowerQuery)) ||
          (props.family && props.family.toLowerCase().includes(lowerQuery)) ||
          (props.type && props.type.toLowerCase().includes(lowerQuery))
        );
      });
    }

    // Filtre par catégorie rapide (chips)
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat) {
        features = features.filter((feat: any) => {
          const c = cat.match.toLowerCase();
          
          // Vérification robuste : est-ce que sports est un tableau avant de faire un .some() ?
          const sportsMatch = Array.isArray(feat.properties.sports) 
            ? feat.properties.sports.some((s: string) => s && typeof s === 'string' && s.toLowerCase().includes(c)) 
            : false;
            
          // Vérification robuste : est-ce que family existe et est bien une chaîne de caractères ?
          const familyMatch = feat.properties.family && typeof feat.properties.family === 'string'
            ? feat.properties.family.toLowerCase().includes(c)
            : false;
            
          return sportsMatch || familyMatch;
        });
      }
    }

    // On recrée un objet GeoJSON formel valide
    return {
      type: 'FeatureCollection',
      features,
    };
  }, [geoJsonData, searchQuery, selectedCategory, categories]);

  // Snap points : 25% (un petit bandeau), 50% (moitié écran), 90% (plein écran)
  // useMemo mémorise les valeurs et prévient les re-rendus couteux de BottomSheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Snap points pour le menu latéral et filtres (en basculant d'en bas comme iOS natif)
  const menuSnapPoints = useMemo(() => ['50%', '80%'], []);
  const filtersSnapPoints = useMemo(() => ['55%', '90%'], []);

  // Déclenché lorsqu'on clique sur un marker un-clustered
  const onMarkerPress = useCallback(async (event: any) => {
    const features = event.features;
    if (!features || features.length === 0) return;
    
    const clickedFeature = features[0];
    
    // S'il s'agit d'un cluster, zommer dessus au lieu d'ouvrir le bottom sheet
    if (clickedFeature.properties.cluster) {
      // Zoomer sur le cluster pour le casser en plus petits points
      const coordinates = clickedFeature.geometry.coordinates;
      
      let targetZoom = 14;
      try {
        if (shapeSourceRef.current) {
          const expansionZoom = await shapeSourceRef.current.getClusterExpansionZoom(clickedFeature);
          if (expansionZoom) targetZoom = expansionZoom;
        }
      } catch (err) {
        console.warn("Impossible de récupérer le zoom d'expansion :", err);
      }

      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: targetZoom + 0.5,
        animationDuration: 1000,
      });
      return;
    }

    // S'il s'agit d'un point simple, on extrait ses propriétés
    const { properties, geometry } = clickedFeature;
    console.log('POI cliqué :', properties);
    
    // Recentrer la caméra sur le point cliqué
    if (geometry && geometry.coordinates) {
      cameraRef.current?.setCamera({
        centerCoordinate: geometry.coordinates,
        zoomLevel: 15,
        padding: { paddingBottom: 350, paddingLeft: 0, paddingRight: 0, paddingTop: 0 }, // Compense l'espace pris par la BottomSheet
        animationDuration: 800,
      });
    }

    // Mettre à jour le state pour afficher les données dans la BottomSheet
    setSelectedFacility(properties);
    
    // Ouvre la BottomSheet au premier SnapPoint (25%) ou deuxième (50%)
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.loader} />
        <Text style={[styles.loadingText, { color: theme.textSub }]}>Chargement des équipements sportifs...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.bg }]}>
        <Text style={styles.errorText}>Impossible de charger les données.</Text>
        <Text style={[styles.errorSubText, { color: theme.textSub }]}>{error?.message || 'Vérifiez que votre Backend Docker est bien lancé.'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* 
        En-tête absolu par-dessus la carte 
        (On utilise SafeAreaView pour éviter de déborder sous l'encoche / notch iOS)
      */}
      <SafeAreaView style={styles.headerAbsoluteContainer} pointerEvents="box-none">
        <View style={[styles.searchBarContainer, { backgroundColor: theme.surface }]} pointerEvents="auto">
          {/* Bouton Hamburger / Menu */}
          <TouchableOpacity style={styles.iconButton} onPress={() => menuSheetRef.current?.snapToIndex(0)}>
            <Ionicons name="menu" size={28} color={theme.iconColor} />
          </TouchableOpacity>

          <TextInput
            style={[styles.searchInput, { color: theme.textMain }]}
            placeholder="Équipement, ville, sport..."
            placeholderTextColor={theme.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {/* Bouton Filtres Avancés */}
          <TouchableOpacity style={styles.iconButton} onPress={() => filtersSheetRef.current?.snapToIndex(0)}>
            <Ionicons name="options" size={24} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.filtersContainer} pointerEvents="auto">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip, 
                    { backgroundColor: theme.chipBg },
                    isSelected && styles.filterChipSelected
                  ]}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
                >
                  <Text style={[
                    styles.filterText, 
                    { color: theme.textMain },
                    isSelected && styles.filterTextSelected
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Wrapper MapboxGL */}
      <MapboxGL.MapView 
        style={styles.map} 
        styleURL={theme.mapStyle}
        scaleBarEnabled={false} // Désactive l'échelle visuelle (0m - 250m - 500m)
        logoEnabled={false} // Masque le logo Mapbox en bas à gauche
        attributionEnabled={false} // Masque le bouton info 'i' (Powered by Mapbox) en bas à droite
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={11}
          centerCoordinate={[5.3698, 43.2965]} // Coordonnées centrées sur Marseille
        />

        {/* Afficher la position de l'utilisateur si la permission est accordée */}
        {locationGranted && (
          <MapboxGL.UserLocation
            renderMode="normal"
            puckBearingEnabled={true}
            puckBearing="heading"
            onUpdate={(location) => {
              if (location?.coords) {
                setUserLocation([location.coords.longitude, location.coords.latitude]);
              }
            }}
          />
        )}

        {/* 
          ShapeSource prend un GeoJSON entier.
          CRITIQUE : cluster={true} délègue le regroupement de pins au SDK en C++.
          Très performant face à des dizaines de milliers de points Django.
        */}
        {filteredGeoJson && (
          <MapboxGL.ShapeSource
            id="facilitiesSource"
            shape={filteredGeoJson as any}
            cluster={true}
            clusterRadius={50}
            onPress={onMarkerPress} // Gère le clic sur les points/clusters
          >
          {/* Style visuel des clusters (le cercle) */}
          <MapboxGL.CircleLayer
            id="clusteredPoints"
            filter={['has', 'point_count']}
            style={{
              circleColor: '#1a659e', // Bleu foncé pour les clusters
              circleRadius: 18,
              circleStrokeWidth: 2,
              circleStrokeColor: '#ffffff',
            }}
          />

          {/* Numéro du cluster (compteur de lieux regroupés) */}
          <MapboxGL.SymbolLayer
            id="pointCount"
            filter={['has', 'point_count']}
            style={{
              textField: '{point_count_abbreviated}',
              textSize: 14,
              textColor: '#ffffff',
              textPitchAlignment: 'map',
            }}
          />

          {/* Style des points individuels (quand non groupés) */}
          <MapboxGL.CircleLayer
            id="unclusteredPoint"
            filter={['!', ['has', 'point_count']]}
            style={{
              circleColor: [
                'case',
                ['==', ['get', 'id'], selectedFacility?.id || ''],
                '#02c39a', // Équipement sélectionné/cliqué
                '#ff6b35'  // Équipement non sélectionné
              ],
              circleRadius: 10,
              circleStrokeWidth: 2,
              circleStrokeColor: '#ffffff',
            }}
          />
        </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Bouton de recentrage de Localisation en bas à droite (juste au-dessus du potentiel menu tab) */}
      <TouchableOpacity 
        style={[styles.locateButton, { backgroundColor: theme.bg }]}
        onPress={centerOnUser}
      >
        <Ionicons name="locate" size={24} color={theme.loader} />
      </TouchableOpacity>

      {/* BottomSheet Modale - Apparait au-dessus de la carte */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // -1 = fermé par défaut à l'ouverture de l'écran
        snapPoints={snapPoints}
        enablePanDownToClose={true} // Permet de swiper vers le bas pour fermer
        backgroundStyle={{ backgroundColor: theme.bg }}
        handleIndicatorStyle={{ backgroundColor: theme.textSub }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: theme.bg }]}>
          {selectedFacility ? (
            <>
              <Text style={[styles.sheetTitle, { color: theme.textMain }]}>{selectedFacility.name || 'Infrastructure Inconnue'}</Text>
              <Text style={styles.sheetSubtitle}>Activité: {selectedFacility.family || 'Non renseignée'}</Text>
              
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailText, { color: theme.textMain }]}><Text style={styles.boldText}>Type:</Text> {selectedFacility.type || 'N/A'}</Text>
                <Text style={[styles.detailText, { color: theme.textMain }]}><Text style={styles.boldText}>Commune (Code):</Text> {selectedFacility.city || 'N/A'}</Text>
                {selectedFacility.address && (
                  <Text style={[styles.detailText, { color: theme.textMain }]}>
                    <Text style={styles.boldText}>Adresse:</Text> {selectedFacility.address}
                  </Text>
                )}
                {selectedFacility.sports && selectedFacility.sports.length > 0 && (
                  <Text style={[styles.detailText, { color: theme.textMain }]}>
                    <Text style={styles.boldText}>Sports:</Text> {selectedFacility.sports.join(', ')}
                  </Text>
                )}
                <Text style={[styles.detailText, { color: theme.textMain }]}>
                  <Text style={styles.boldText}>Accès Libre:</Text> {selectedFacility.free_access ? 'Oui' : 'Non'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.sheetTitle, { color: theme.textMain }]}>Sélectionnez un lieu</Text>
              <Text style={[styles.sheetText, { color: theme.textSub }]}>Cliquez sur un point de la carte pour afficher ses informations en détail.</Text>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* 
        BottomSheet Menu / Mon Profil 
        C'est hyper ergonomique (1 main) et supprime le besoin d'un drawer caché.
      */}
      <BottomSheet
        ref={menuSheetRef}
        index={-1}
        snapPoints={menuSnapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: theme.bg }}
        handleIndicatorStyle={{ backgroundColor: theme.textSub }}
      >
        <BottomSheetView style={[styles.menuContent, { backgroundColor: theme.bg }]}>
          <Text style={[styles.menuHeader, { color: theme.textMain }]}>Mon Compte</Text>
          <Text style={[styles.menuSubHeader, { color: theme.textSub }]}>Gérez votre profil SportMap</Text>

          <View style={styles.menuOptionsList}>
            {/* Option Favoris */}
            <TouchableOpacity style={[styles.menuOption, { borderBottomColor: theme.border }]}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#ffeaa7' }]}>
                <Ionicons name="star" size={20} color="#fdcb6e" />
              </View>
              <Text style={[styles.menuOptionText, { color: theme.textMain }]}>Mes Lieux Favoris</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Option Signalement */}
            <TouchableOpacity style={[styles.menuOption, { borderBottomColor: theme.border }]}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#fab1a0' }]}>
                <Ionicons name="warning" size={20} color="#e17055" />
              </View>
              <Text style={[styles.menuOptionText, { color: theme.textMain }]}>Signaler un équipement endommagé</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Option Ajouter un lieu (Gamification) */}
            <TouchableOpacity style={[styles.menuOption, { borderBottomColor: theme.border }]}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#55efc4' }]}>
                <Ionicons name="add-circle" size={20} color="#00b894" />
              </View>
              <Text style={[styles.menuOptionText, { color: theme.textMain }]}>Proposer un nouveau Terrain</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Option Carte Hors-Ligne (Pertinent Mapbox !) */}
            <TouchableOpacity style={[styles.menuOption, { borderBottomColor: theme.border }]}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#81ecec' }]}>
                <Ionicons name="cloud-offline" size={20} color="#00cec9" />
              </View>
              <Text style={[styles.menuOptionText, { color: theme.textMain }]}>Télécharger la carte hors-ligne</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Option Thème (Paramètres d'apparence) */}
            <TouchableOpacity 
              style={[styles.menuOption, { borderBottomColor: theme.border }]}
              onPress={() => {
                setThemeOverride(prev => prev === 'system' ? 'dark' : prev === 'dark' ? 'light' : 'system');
              }}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#a29bfe' }]}>
                <Ionicons name={themeOverride === 'system' ? 'contrast' : themeOverride === 'dark' ? 'moon' : 'sunny'} size={20} color="#6c5ce7" />
              </View>
              <Text style={[styles.menuOptionText, { color: theme.textMain }]}>
                Apparence : {themeOverride === 'system' ? 'Système' : themeOverride === 'dark' ? 'Sombre' : 'Clair'}
              </Text>
              <Ionicons name="color-palette-outline" size={20} color={theme.iconColor} />
            </TouchableOpacity>

            {/* Déconnexion */}
            <TouchableOpacity style={styles.menuOptionBtnDisconnect} onPress={() => {
                alert('Déconnexion en cours...');
                // useAuthStore.getState().logout()
            }}>
              <Ionicons name="log-out-outline" size={22} color="#ff7675" />
              <Text style={styles.menuTextDisconnect}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* 
        BottomSheet Filtres Avancés 
      */}
      <BottomSheet
        ref={filtersSheetRef}
        index={-1}
        snapPoints={filtersSnapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: theme.bg }}
        handleIndicatorStyle={{ backgroundColor: theme.textSub }}
      >
        <BottomSheetView style={[styles.menuContent, { backgroundColor: theme.bg }]}>
          <Text style={[styles.menuHeader, { color: theme.textMain }]}>Filtres Avancés</Text>
          <Text style={[styles.menuSubHeader, { color: theme.textSub }]}>Affinez votre recherche d'équipement</Text>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.textMain }]}>Accessibilité</Text>
            <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.filterRowText, { color: theme.textMain }]}>Accès Libre (Gratuit)</Text>
              <Switch value={true} onValueChange={() => {}} trackColor={{ false: theme.border, true: '#2ecc71' }} thumbColor="#fff" />
            </View>
            <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.filterRowText, { color: theme.textMain }]}>Accès Handicapé</Text>
              <Switch value={false} onValueChange={() => {}} trackColor={{ false: theme.border, true: '#2ecc71' }} thumbColor="#fff" />
            </View>
            <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.filterRowText, { color: theme.textMain }]}>Éclairage de nuit</Text>
              <Switch value={false} onValueChange={() => {}} trackColor={{ false: theme.border, true: '#2ecc71' }} thumbColor="#fff" />
            </View>
            <View style={[styles.filterRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.filterRowText, { color: theme.textMain }]}>Sanitaires & Vestiaires</Text>
              <Switch value={false} onValueChange={() => {}} trackColor={{ false: theme.border, true: '#2ecc71' }} thumbColor="#fff" />
            </View>
          </View>

          <View style={styles.filterSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.filterSectionTitle, { color: theme.textMain }]}>Rayon de recherche</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.loader }}>{searchRadius === 50 ? 'Illimité' : `${searchRadius} km`}</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40, marginTop: 10 }}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={searchRadius}
              onValueChange={(val) => setSearchRadius(val)}
              minimumTrackTintColor={theme.loader}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.loader}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 }}>
              <Text style={{ color: theme.textSub, fontSize: 12 }}>1 km</Text>
              <Text style={{ color: theme.textSub, fontSize: 12 }}>Illimité</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.applyFilterBtn} onPress={() => filtersSheetRef.current?.close()}>
            <Text style={styles.applyFilterBtnText}>Appliquer (120 résultats)</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  errorSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  map: {
    flex: 1,
  },
  headerAbsoluteContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    backgroundColor: 'transparent', // Important pour ne pas bloquer les touch de la carte derrière SafeArea
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 25, // Plus arrondi, type Google Maps
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  iconButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1, // Prend tout l'espace restant entre les deux icônes
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 5, // Laisse de l'ombre visuelle
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterChipSelected: {
    backgroundColor: '#135b75', // Même couleur que nos clusters
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextSelected: {
    color: 'white',
  },
  sheetContent: {
    flex: 1,
    padding: 24,
    alignItems: 'flex-start',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 16,
    color: '#51bbd6', // Bleu sportif
    fontWeight: '600',
    marginBottom: 15,
  },
  sheetText: {
    fontSize: 16,
    color: '#555',
  },
  detailsContainer: {
    marginTop: 10,
    width: '100%',
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  boldText: {
    fontWeight: 'bold',
  },
  
  // -- STYLES DU MENU --
  menuContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  menuHeader: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2d3436',
  },
  menuSubHeader: {
    fontSize: 15,
    color: '#636e72',
    marginTop: 5,
    marginBottom: 30,
  },
  menuOptionsList: {
    flexDirection: 'column',
    gap: 15, // Espace entre chaque ligne
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  menuOptionBtnDisconnect: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#ffeaa7', // Légèrement orangé pour montrer le profil "Sortir"
    justifyContent: 'center',
  },
  menuTextDisconnect: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff7675',
  },

  // -- STYLES DU PANNEAU FILTRES --
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  filterRowText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  distanceChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  distanceChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
  },
  distanceChipActive: {
    backgroundColor: '#135b75',
  },
  distanceChipText: {
    color: '#636e72',
    fontWeight: '600',
    fontSize: 14,
  },
  distanceChipActiveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  applyFilterBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyFilterBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locateButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
