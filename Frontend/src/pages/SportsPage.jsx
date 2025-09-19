import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSports } from '../hooks/useSports';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SportsPage = () => {
  const { sports, errorSports, loadingSports } = useSports();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (loadingSports) return <LoadingSpinner />;
  if (errorSports) return <div>Error loading sports</div>;

  const filteredSports = sports?.filter(sport =>
    sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSportClick = (sport) => {
    window.scrollTo(0, 0);
    navigate(`/map?sports=${encodeURIComponent(sport)}`);
  };

  return (
    <div className="w-screen flex-1 flex flex-col">
      <div className="px-4 py-8 flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Découvrez les Sports à Marseille
          </h1>

          {/* Barre de recherche */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-black rounded-xl border bg-white border-gray-200 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                         transition-all duration-200 outline-none shadow-sm"
              />
              <svg
                className="absolute left-3 top-3.5 text-gray-400 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Grille des sports */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSports?.map((sport, index) => (
              <div
                key={index}
                onClick={() => handleSportClick(sport)}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg 
                         overflow-hidden cursor-pointer transition-all duration-300"
              >
                <div className="p-6 flex flex-col items-center justify-center h-full">
                  <h3 className="text-xl font-semibold text-gray-900 text-center 
                               group-hover:text-blue-600 transition-colors duration-300">
                    {sport}
                  </h3>
                  
                  <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500 
                                transition-colors duration-300">
                    Voir sur la carte →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredSports?.length === 0 && (
            <div className="flex-1 text-center py-8 text-gray-500">
              Aucun sport ne correspond à votre recherche
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsPage;
