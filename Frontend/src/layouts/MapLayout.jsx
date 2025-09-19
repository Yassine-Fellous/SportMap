import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function MapLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 bg-white-800 flex justify-between items-center border-b border-gray-200 relative">
        {/* Même navigation que MainLayout mais sans le Footer */}
        {/* ... */}
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
} 