// Desc: Format sports string to display them in a nice way
export const formatSports = (sports) => {
  // ✅ VÉRIFICATION ROBUSTE DU TYPE
  if (!sports || typeof sports !== 'string') {
    console.warn('formatSports: valeur invalide reçue:', sports, 'Type:', typeof sports);
    return 'Non spécifié';
  }
  
  // ✅ VÉRIFICATION SUPPLÉMENTAIRE POUR STRING VIDE
  if (sports.trim() === '') {
    return 'Non spécifié';
  }
  
  const regex = /'([^']*)'|"([^"]*)"/g;
  const sportsArray = sports.match(regex);
  
  if (!sportsArray || sportsArray.length === 0) {
    console.warn('formatSports: aucun sport trouvé dans:', sports);
    return 'Non spécifié';
  }
  
  return sportsArray.map(sport => sport.replace(/['"]+/g, '')).join(', ');
};