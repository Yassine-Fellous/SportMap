import { useState, useEffect } from 'react';

export const useEquipments = () => {
  const [equipments, setEquipments] = useState(null);
  const [errorEquipments, setError] = useState(null);
  const [loadingEquipments, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const loadEquipments = async () => {
      try {
        console.log('🔄 Chargement des équipements depuis:', `${apiUrl}/geojson/`);
        
        const response = await fetch(`${apiUrl}/geojson/`);
        if (!response.ok) {
          throw new Error('Erreur réseau lors du chargement des équipements');
        }
        
        const data = await response.json();
        console.log('✅ Équipements chargés:', data.features?.length || 0, 'équipements');
        
        setEquipments(data);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Erreur chargement équipements:', error);
        setError(error);
        setLoading(false);
      }
    };

    loadEquipments();
  }, []);

  return { 
    equipments, 
    errorEquipments, 
    loadingEquipments
  };
};