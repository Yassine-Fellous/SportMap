import React from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import { User, MapPin, AlertTriangle, Settings } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user?.username || user?.name}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Profil</h3>
                <p className="text-sm text-gray-500">Gérer vos informations</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
          </div>

          {/* Map Card */}
          <Link to="/map" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Carte</h3>
                <p className="text-sm text-gray-500">Explorer les équipements</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Découvrez les installations sportives près de chez vous
            </p>
          </Link>

          {/* add contact form */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;