import { formatSports } from './formatSports';

export const backgroundStyleSport = (sports) => {
  // ✅ VÉRIFICATION AVANT FORMATAGE
  if (!sports || typeof sports !== 'string') {
    console.warn('backgroundStyleSport: valeur invalide:', sports, 'Type:', typeof sports);
    return [];
  }

  const colors = [
    'bg-green-300',
    'bg-orange-300',
    'bg-yellow-300',
    'bg-blue-300',
    'bg-teal-300',
    'bg-red-300',
    'bg-purple-300',
    'bg-pink-300',
    'bg-indigo-300',
    'bg-gray-300'
  ];
  
  const formattedSports = formatSports(sports);
  
  // ✅ VÉRIFIER QUE formatSports RETOURNE UNE STRING VALIDE
  if (!formattedSports || formattedSports === 'Non spécifié') {
    return [];
  }
  
  return formattedSports.split(',').map((sport, index) => {
    const trimmedSport = sport.trim();
    if (!trimmedSport) return null; // ✅ ÉVITER LES STRINGS VIDES
    
    const colorClass = colors[index % colors.length];
    return (
      <span key={trimmedSport} className={`px-2 py-1 m-1 text-white rounded-xl ${colorClass}`}>
        {trimmedSport}
      </span>
    );
  }).filter(Boolean); // ✅ FILTRER LES VALEURS NULL
};