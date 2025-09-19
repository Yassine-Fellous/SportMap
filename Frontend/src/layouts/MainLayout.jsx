import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 bg-white-800 flex justify-between items-center border-b border-gray-200 relative">
        {/* Navigation existante */}
        <Link to="/" className="text-black p-2 mr-4">Marseille-sport</Link>
        
        {/* Hamburger button */}
        <button 
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          w-full
          lg:w-auto
          shadow-lg
          lg:shadow-none
          z-50
          border-b
          border-gray-200
          lg:border-none
        `}>
          {/* ... reste de la navigation ... */}
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
} 