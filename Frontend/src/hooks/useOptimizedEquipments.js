// Frontend/src/hooks/useOptimizedEquipments.js
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export const useOptimizedEquipments = (filters) => {
  const { data, isLoading } = useQuery({
    queryKey: ['equipments', filters],
    queryFn: () => fetchEquipments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  const processedData = useMemo(() => {
    if (!data) return [];
    
    // Traitement optimisé
    return data.map(item => ({
      ...item,
      // Pré-calculer les propriétés coûteuses
      sportsList: item.sports?.split(',') || [],
      coordinates: [item.lon, item.lat]
    }));
  }, [data]);

  return { data: processedData, isLoading };
};