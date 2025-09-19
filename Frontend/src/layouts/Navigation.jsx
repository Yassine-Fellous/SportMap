import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="p-4 bg-white flex justify-between items-center border-b border-gray-200 relative shrink-0">
      <Link to={ROUTES.HOME} className="text-black p-2 mr-4 font-semibold">
        SportMap Marseille
      </Link>
      
      {/* Hamburger button */}
      <button 
        className="lg:hidden p-2"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </button>

      {/* Navigation links */}
      <div className={`
        lg:flex
        ${isMenuOpen ? 'flex' : 'hidden'}
        flex-col
        lg:flex-row
        absolute
        lg:relative
        top-full
        left-0
        right-0
        bg-white
        lg:bg-transparent
        z-50
        shadow-lg
        lg:shadow-none
      `}>
        <div className="flex flex-col lg:flex-row w-full lg:w-auto">
          {/* Navigation principale */}
          <Link 
            to={ROUTES.HOME} 
            className={`text-black p-4 lg:p-2 lg:mr-4 hover:bg-gray-100 lg:hover:bg-transparent border-b lg:border-none border-gray-100 ${
              isActive(ROUTES.HOME) ? 'font-semibold' : ''
            }`}
            onClick={closeMenu}
          >
            Accueil
          </Link>
          
          <Link 
            to={ROUTES.MAP} 
            className={`text-white bg-blue-500 hover:bg-blue-600 p-4 lg:px-4 lg:py-2 lg:rounded-lg lg:mr-4 border-b lg:border-none border-gray-100 transition-colors ${
              isActive(ROUTES.MAP) ? 'bg-blue-700' : ''
            }`}
            onClick={closeMenu}
          >
          Carte
          </Link>
          
          <Link 
            to={ROUTES.SPORTS} 
            className={`text-black p-4 lg:p-2 lg:mr-4 hover:bg-gray-100 lg:hover:bg-transparent border-b lg:border-none border-gray-100 ${
              isActive(ROUTES.SPORTS) ? 'font-semibold' : ''
            }`}
            onClick={closeMenu}
          >
            Sports
          </Link>
          
          <Link 
            to={ROUTES.ABOUT} 
            className={`text-black p-4 lg:p-2 lg:mr-4 hover:bg-gray-100 lg:hover:bg-transparent border-b lg:border-none border-gray-100 ${
              isActive(ROUTES.ABOUT) ? 'font-semibold' : ''
            }`}
            onClick={closeMenu}
          >
            À propos
          </Link>
          
          
          {/* Section Authentification */}
          <div className="flex flex-col lg:flex-row lg:ml-4 border-t lg:border-none border-gray-100 pt-4 lg:pt-0">
            {user ? (
              // Utilisateur connecté
              <>
                <Link 
                  to={ROUTES.DASHBOARD} 
                  className={`text-gray-700 p-4 lg:p-2 lg:mr-3 hover:bg-gray-100 lg:hover:bg-transparent transition-colors ${
                    isActive(ROUTES.DASHBOARD) ? 'font-semibold' : ''
                  }`}
                  onClick={closeMenu}
                >
                  👤 {user.email.split('@')[0]} {/* Afficher la partie avant @ de l'email */}
                </Link>
                <button 
                  onClick={() => { logout(); closeMenu(); }}
                  className="text-red-600 p-4 lg:p-2 lg:mr-3 hover:bg-gray-100 lg:hover:bg-transparent hover:text-red-700 transition-colors text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              // Utilisateur non connecté
              <>
                <Link 
                  to={ROUTES.LOGIN} 
                  className={`text-gray-600 p-4 lg:p-2 lg:mr-3 hover:bg-gray-100 lg:hover:bg-transparent hover:text-gray-900 transition-colors ${
                    isActive(ROUTES.LOGIN) ? 'font-semibold' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Connexion
                </Link>
                <Link 
                  to={ROUTES.REGISTER} 
                  className={`text-white bg-green-600 hover:bg-green-700 p-4 lg:px-4 lg:py-2 lg:rounded-lg transition-colors font-medium text-center ${
                    isActive(ROUTES.REGISTER) ? 'bg-green-800' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

