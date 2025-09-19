import React, { useState } from 'react';
import { Search } from 'lucide-react'; // ✅ AJOUTER L'IMPORT

const SearchBar = ({ onSearch, suggestions, onSuggestionClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value); // Trigger search as the user types
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion); // Notify parent component of the clicked suggestion
    setSearchTerm(''); // Clear the search input
  };

  return (
    <div style={styles.searchBarContainer}>
      <input
        type="text"
        placeholder="Search a sport..."
        value={searchTerm}
        onChange={handleInputChange}
        style={styles.searchInput}
      />
      
      {/* ✅ AJOUTER L'ICÔNE LOUPE À DROITE */}
      <Search 
        size={20} 
        style={{
          color: '#6b7280',
          marginLeft: '8px',
          flexShrink: 0,
        }} 
      />

      {/* Suggestions Container */}
      {suggestions.length > 0 && (
        <div style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ GARDER LES STYLES EXISTANTS (pas de modification)
const styles = {
  searchBarContainer: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '25px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '8px 16px',
    width: '60%',
    maxWidth: '400px',
    zIndex: 49,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#6b7280',
    backgroundColor: 'transparent',
    width: '100%',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginTop: '8px',
    zIndex: 49,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#4b5563',
    cursor: 'pointer',
    borderBottom: '1px solid #e5e7eb',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
};

export default SearchBar;