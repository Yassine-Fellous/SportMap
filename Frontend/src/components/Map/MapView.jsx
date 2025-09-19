import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Map, { Source, Layer } from 'react-map-gl';
import { ToggleLeft, ToggleRight, Filter } from 'lucide-react';

// Constants
import { MAPBOX_TOKEN, INITIAL_VIEW_STATE } from '@/constants/mapConfig';

// Hooks
import { useEquipments } from '@/hooks/useEquipments';
import { useSports } from '@/hooks/useSports';

// Components
import MapPopup from './popup/MapPopup';
import { LoadingSpinner } from '../LoadingSpinner';
import SearchBar from './searchBar/SearchBar';
import { clusterLayer, clusterCountLayer, unclusteredPointLayer, sportIconLayer } from './layers';
import Navigation from '../../layouts/Navigation';

// Utils
import { formatSports } from '@/utils/formatSports';

// Styles
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapView() {
  // ✅ GESTION D'ERREUR POUR ÉVITER LES CRASHES
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('❌ Erreur dans MapView:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h2>Erreur de chargement de la carte</h2>
        <p>Veuillez rafraîchir la page</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Rafraîchir
        </button>
      </div>
    );
  }

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [styleLoaded, setStyleLoaded] = useState(false);
  
  // ✅ HOOKS
  const { equipments, errorEquipments, loadingEquipments } = useEquipments();
  const { sports, errorSports, loadingSports } = useSports();
  
  // ✅ ÉTATS
  const [popupInfoEquipment, setPopupInfoEquipment] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFreeAccessOnly, setShowFreeAccessOnly] = useState(false);
  const [showHandicapAccessOnly, setShowHandicapAccessOnly] = useState(false);
  const [showFiltersPopup, setShowFiltersPopup] = useState(false);
  const [showSportsPopup, setShowSportsPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showUnifiedPopup, setShowUnifiedPopup] = useState(false);

  // ✅ MÉMORISER getFilteredFeatures AVEC useMemo AU LIEU DE useCallback
  const filteredEquipments = useMemo(() => {
    if (!equipments?.features) {
      return { type: 'FeatureCollection', features: [] };
    }

    let features = equipments.features;
    
    if (activeFilters.length > 0) {
      features = features.filter(feature => {
        const sportsProperty = feature.properties.sports;
        let equipmentSports = [];
        
        if (Array.isArray(sportsProperty)) {
          equipmentSports = sportsProperty;
        } else if (typeof sportsProperty === 'string') {
          const formattedSports = formatSports(sportsProperty);
          if (formattedSports === 'Non spécifié') {
            return false;
          }
          equipmentSports = formattedSports.split(', ').map(s => s.trim());
        } else {
          return false;
        }
        
        const hasMatch = activeFilters.some(filter => 
          equipmentSports.some(sport => {
            const sportLower = sport.toLowerCase();
            const filterLower = filter.toLowerCase();
            return sportLower.includes(filterLower) || filterLower.includes(sportLower);
          })
        );
        
        return hasMatch;
      });
    }

    if (showFreeAccessOnly) {
      features = features.filter(feature => {
        const freeAccess = feature.properties.free_access;
        return freeAccess === true || freeAccess === 'true' || freeAccess === 'Oui';
      });
    }

    if (showHandicapAccessOnly) {
      features = features.filter(feature => {
        const handicapAccess = feature.properties.inst_acc_handi_bool;
        return handicapAccess === true;
      });
    }

    return {
      type: 'FeatureCollection',
      features: features
    };
  }, [equipments, activeFilters, showFreeAccessOnly, showHandicapAccessOnly]);

  // ✅ MÉMORISER handleSuggestionClick
  const handleSuggestionClick = useCallback((suggestion) => {
    console.log('🔍 Ajout du sport:', suggestion);
    
    setShowFiltersPopup(false);
    setShowSportsPopup(false);
    setPopupInfoEquipment(null);
    setShowNavigation(false);
    
    if (!activeFilters.includes(suggestion)) {
      const newFilters = [...activeFilters, suggestion];
      setActiveFilters(newFilters);
      
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('sports', newFilters.join(','));
      newSearchParams.delete('sport');
      setSearchParams(newSearchParams, { replace: true });
    }
    
    setSearchSuggestions([]);
  }, [activeFilters, searchParams, setSearchParams]);

  // ✅ MÉMORISER handleRemoveFilter
  const handleRemoveFilter = useCallback((filterToRemove) => {
    console.log('🗑️ Suppression du filtre:', filterToRemove);
    
    const newFilters = activeFilters.filter(filter => filter !== filterToRemove);
    setActiveFilters(newFilters);
    
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newFilters.length > 0) {
      newSearchParams.set('sports', newFilters.join(','));
    } else {
      newSearchParams.delete('sports');
      newSearchParams.delete('sport');
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [activeFilters, searchParams, setSearchParams]);

  // ✅ USEEFFECT SIMPLIFIÉ POUR LES PARAMÈTRES URL
  useEffect(() => {
    const sportParam = searchParams.get('sport');
    const sportsParam = searchParams.get('sports');
    
    let sportsToFilter = [];
    
    if (sportsParam) {
      sportsToFilter = sportsParam.split(',').map(s => s.trim());
    } else if (sportParam) {
      sportsToFilter = [sportParam.trim()];
    }
    
    // ✅ COMPARAISON SIMPLE
    const currentFiltersString = [...activeFilters].sort().join(',');
    const newFiltersString = [...sportsToFilter].sort().join(',');
    
    if (sportsToFilter.length > 0 && sports && currentFiltersString !== newFiltersString) {
      const validSports = sportsToFilter.filter(sport => sports.includes(sport));
      
      if (validSports.length > 0) {
        setActiveFilters(validSports);
        
        if (sportParam && !sportsParam) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('sport');
          newSearchParams.set('sports', validSports.join(','));
          setSearchParams(newSearchParams, { replace: true });
        }
      }
    } else if (sportsToFilter.length === 0 && activeFilters.length > 0) {
      setActiveFilters([]);
    }

    // Handle URL parameters for shared equipment
    const equipmentId = searchParams.get('equipmentId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');

    if (equipmentId && lat && lng && equipments) {
      const equipment = equipments.features?.find(
        feature => feature.properties.id === equipmentId
      );

      if (equipment) {
        setPopupInfoEquipment({
          longitude: parseFloat(lng),
          latitude: parseFloat(lat),
          properties: equipment.properties
        });

        setViewState(prevState => ({
          ...prevState,
          longitude: parseFloat(lng),
          latitude: parseFloat(lat),
          zoom: zoom ? parseFloat(zoom) : 18
        }));
      }
    }
  }, [searchParams, sports, equipments]); // ✅ RETIRER activeFilters DES DÉPENDANCES

  // ✅ USEEFFECT POUR ESCAPE
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowFiltersPopup(false);
        setShowSportsPopup(false);
        setPopupInfoEquipment(null);
        setShowMenu(false);
        setShowNavigation(false);
        setShowUnifiedPopup(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // ✅ USEEFFECT POUR LES STYLES CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sports-scroll::-webkit-scrollbar {
        width: 6px;
      }
      
      .sports-scroll::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      
      .sports-scroll::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 3px;
      }
      
      .sports-scroll::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (errorEquipments) {
    return <div>Error loading map data</div>;
  }

  if (loadingEquipments) {
    return <LoadingSpinner />;
  }

  const onClick = (event) => {
    const feature = event.features?.[0];
    if (feature && feature.layer.id === 'unclustered-point') {
      const equipmentId = feature.properties?.id || feature.id;
      const longitude = feature.geometry.coordinates[0];
      const latitude = feature.geometry.coordinates[1];
      
      console.log('🎯 Clic équipement:', { equipmentId, longitude, latitude });
      
      setShowFiltersPopup(false);
      setShowSportsPopup(false);
      setShowUnifiedPopup(false);
      setShowNavigation(false);
      
      const isDesktop = window.innerWidth >= 1024;
      
      if (!isDesktop) {
        let offset;
        if (window.innerWidth <= 768) {
          offset = 0.004;
        } else {
          offset = 0.015;
        }
        
        setViewState(prevState => ({
          ...prevState,
          longitude: longitude,
          latitude: latitude + offset,
          transitionDuration: 600
        }));
      } else {
        setViewState(prevState => ({
          ...prevState,
          longitude: longitude,
          latitude: latitude,
          transitionDuration: 400
        }));
      }
      
      setPopupInfoEquipment({
        longitude: longitude,
        latitude: latitude,
        properties: {
          ...feature.properties,
          id: equipmentId
        },
        id: equipmentId,
        geometry: feature.geometry
      });
    } else {
      setShowUnifiedPopup(false);
      setPopupInfoEquipment(null);
      setShowMenu(false);
      setShowNavigation(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setSearchSuggestions([]);
      return;
    }
    if (searchTerm.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const suggestions = sports.filter(sport =>
      sport.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearchTerm)
    );
    setSearchSuggestions(suggestions);
  };

  const onMapLoad = (event) => {
    const map = event.target;
    setStyleLoaded(true);
    
    map.loadImage('/map-pinv9.png', (error, image) => {
      if (error) {
        console.error('❌ Erreur chargement /map-pinv9.png:', error);
        return;
      }
      if (!map.hasImage('map-pin')) {
        map.addImage('map-pin', image);
        console.log('✅ map-pin chargé');
      }
    });

    map.loadImage('/map-pin-active.png', (error, image) => {
      if (error) {
        console.error('❌ Erreur chargement /map-pin-active.png:', error);
        return;
      }
      if (!map.hasImage('map-pin-active')) {
        map.addImage('map-pin-active', image);
        console.log('✅ map-pin-active chargé');
      }
    });
  };

  const getUnclusteredPointLayer = () => {
    const selectedId = popupInfoEquipment?.properties?.id || popupInfoEquipment?.id;
    
    return {
      ...unclusteredPointLayer,
      layout: {
        ...unclusteredPointLayer.layout,
        'icon-image': [
          'case',
          ['==', ['get', 'id'], selectedId || ''],
          'map-pin-active',
          'map-pin'
        ],
        'icon-size': [
          'case',
          ['==', ['get', 'id'], selectedId || ''],
          0.1,
          0.3
        ]
      }
    };
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Top Controls */}
      <div style={{
        position: 'absolute',
        top: showNavigation ? '100px' : '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 49,
        transition: 'top 0.3s ease',
      }}>
        {/* Icône unifiée */}
        <div 
          style={{
            backgroundColor: activeFilters.length > 0 || showFreeAccessOnly || showHandicapAccessOnly ? '#3b82f6' : 'white',
            color: activeFilters.length > 0 || showFreeAccessOnly || showHandicapAccessOnly ? 'white' : 'black',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onClick={() => {
            setPopupInfoEquipment(null);
            setShowMenu(false);
            setShowNavigation(false);
            setShowUnifiedPopup(!showUnifiedPopup);
          }}
        >
          <span style={{ fontSize: '18px' }}>⚽</span>
          <Filter size={18} />
          
          {(activeFilters.length > 0 || showFreeAccessOnly || showHandicapAccessOnly) && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              {activeFilters.length + (showFreeAccessOnly ? 1 : 0) + (showHandicapAccessOnly ? 1 : 0)}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div style={{
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowUnifiedPopup(false);
          setPopupInfoEquipment(null);
          setShowMenu(false);
          setShowNavigation(!showNavigation);
        }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '3px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '3px', backgroundColor: '#000', borderRadius: '1px' }}></div>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>Menu</span>
        </div>
      </div>

      {/* Navigation Bar */}
      {showNavigation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 51,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Navigation />
        </div>
      )}

      <Map
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1
        }}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        interactiveLayerIds={['clusters', 'unclustered-point']}
        onClick={onClick}
        onLoad={onMapLoad}
        onError={(e) => console.error('Map style loading error:', e)}
      >
        {/* SearchBar */}
        <div style={{ 
          position: 'absolute', 
          top: showNavigation ? '140px' : '80px',
          left: '20px',
          right: '20px',
          zIndex: 48,
          transition: 'top 0.2s ease',
        }}>
          <SearchBar
            onSearch={handleSearch}
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        {/* Map Layers */}
        {styleLoaded && filteredEquipments && (
          <Source
            id="equipments"
            type="geojson"
            data={filteredEquipments}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={35}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...getUnclusteredPointLayer()} key={popupInfoEquipment?.properties?.id || 'default'} />
            <Layer {...sportIconLayer} />
          </Source>
        )}

        {/* Debug Info */}
        {styleLoaded && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000
          }}>
            Points: {filteredEquipments?.features?.length || 0}
            <br />
            Style: {styleLoaded ? '✅' : '❌'}
          </div>
        )}

        {/* Map Popup */}
        <MapPopup
          popupInfo={popupInfoEquipment}
          onClose={() => setPopupInfoEquipment(null)}
        />
      </Map>

      {/* Popup Unifiée */}
      {showUnifiedPopup && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: activeFilters.length > 0 ? '55%' : '45%',
            backgroundColor: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            zIndex: 49,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ position: 'absolute', width: '100%', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 600, color: '#000000' }}>
                Sports & Filtres
              </h3>
            </div>
            <button
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: '1px solid #000000',
                borderRadius: '10px',
                background: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s ease',
              }}
              onClick={() => setShowUnifiedPopup(false)}
            >
              ×
            </button>
          </div>

          {/* Section 1: Filtres d'accès */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: 600, color: '#000000', fontSize: '16px' }}>
              Filtres d'accès
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Free Access Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>Libre accès</span>
                <div 
                  onClick={() => setShowFreeAccessOnly(!showFreeAccessOnly)} 
                  style={{ 
                    cursor: 'pointer',
                    width: '50px',
                    height: '20px',
                    backgroundColor: showFreeAccessOnly ? '#3b82f6' : '#e5e7eb',
                    borderRadius: '10px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      top: '2px',
                      left: showFreeAccessOnly ? '32px' : '2px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              </div>

              {/* Handicap Access Filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '500', color: '#000000', fontSize: '14px' }}>Accès handicapé</span>
                  <span style={{ fontSize: '16px' }}>♿</span>
                </div>
                <div 
                  onClick={() => setShowHandicapAccessOnly(!showHandicapAccessOnly)} 
                  style={{ 
                    cursor: 'pointer',
                    width: '50px',
                    height: '20px',
                    backgroundColor: showHandicapAccessOnly ? '#3b82f6' : '#e5e7eb',
                    borderRadius: '10px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      top: '2px',
                      left: showHandicapAccessOnly ? '32px' : '2px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Sports sélectionnés */}
          <div style={{ 
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontWeight: 600, color: '#000000', fontSize: '16px' }}>
                Sports sélectionnés ({activeFilters.length})
              </h4>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete('sports');
                    newSearchParams.delete('sport');
                    setSearchParams(newSearchParams, { replace: true });
                  }}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🗑️ Tout effacer
                </button>
              )}
            </div>

            {activeFilters.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e0 #f7fafc',
              }}>
                {activeFilters.map((filter, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{
                      color: '#1e293b',
                      fontWeight: '500',
                      fontSize: '13px',
                      flex: 1,
                      marginRight: '8px',
                    }}>
                      {filter.length > 25 ? `${filter.substring(0, 25)}...` : filter}
                    </span>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                      }}
                      title={`Supprimer "${filter}"`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                padding: '20px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Aucun sport sélectionné
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  Utilisez la barre de recherche pour filtrer par sport
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Résumé */}
          {(activeFilters.length > 0 || showFreeAccessOnly || showHandicapAccessOnly) && (
            <div style={{ 
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid #d1fae5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#065f46' }}>
                  {(() => {
                    const totalFilters = activeFilters.length + (showFreeAccessOnly ? 1 : 0) + (showHandicapAccessOnly ? 1 : 0);
                    const pointsCount = filteredEquipments?.features?.length || 0;
                    return `${totalFilters} filtre(s) actif(s) • ${pointsCount} équipement(s) affiché(s)`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}