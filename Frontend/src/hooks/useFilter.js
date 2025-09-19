import { useState, useEffect } from 'react';

export const useFilter = (equipments, sports) => {
  const [filteredEquipments, setFilteredEquipments] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);

  const formatSports = (sports) => {
    if (!sports) return [];
    return sports.split(',').map(sport => sport.trim().replace(/['"]+/g, ''));
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredEquipments(null);
      setSearchSuggestions([]);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const suggestions = sports.filter(sport =>
      sport.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearchTerm)
    );
    setSearchSuggestions(suggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!selectedFilters.includes(suggestion)) {
      setSelectedFilters([...selectedFilters, suggestion]);
    }
  };

  const handleRemoveFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  useEffect(() => {
    if (selectedFilters.length > 0) {
      const filtered = equipments.features.filter(equipment =>
        selectedFilters.some(filter => formatSports(equipment.properties.sports).includes(filter))
      );
      setFilteredEquipments({ ...equipments, features: filtered });
    } else {
      setFilteredEquipments(null);
    }
  }, [selectedFilters, equipments]);

  return {
    filteredEquipments,
    searchSuggestions,
    selectedFilters,
    handleSearch,
    handleSuggestionClick,
    handleRemoveFilter,
  };
};