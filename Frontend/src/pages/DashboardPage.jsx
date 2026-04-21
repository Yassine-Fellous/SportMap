import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import { User, MapPin, AlertTriangle, Settings, Activity, Clock, ShieldAlert } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fonction de mock ou de fetch réel si l'utilisateur est un agent de la mairie
  useEffect(() => {
    // Si l'utilisateur n'a pas de rôle (parce que l'API n'est pas encore branchée),
    // on force temporairement MUNICIPAL_AGENT pour que vous puissiez voir le design
    const role = user?.role || 'MUNICIPAL_AGENT'; 
    
    if (role === 'MUNICIPAL_AGENT' || role === 'SUPER_ADMIN') {
      setLoading(true);
      // Simulation d'appel API vers notre nouveau microservice Django
      // axios.get('/api/analytics/municipal-dashboard/')
      setTimeout(() => {
        setStats({
          metrics: { health_score_pct: 98.4, active_alerts: 12, avg_resolution_days: 2 },
          heatmap: [
            { categorie: 'Éclairage défectueux', count: 5 },
            { categorie: 'Dégradation sol', count: 3 },
            { categorie: 'Propreté', count: 2 },
            { categorie: 'Panier cassé', count: 2 }
          ]
        });
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const isMunicipal = user?.role === 'MUNICIPAL_AGENT' || user?.role === 'SUPER_ADMIN' || !user?.role; // Force display pour la démo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Tableau de Bord {isMunicipal ? "Municipal" : "Citoyen"}
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                Bienvenue, Mairie de Paris
                {isMunicipal && <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Agent Municipal</span>}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* --- SECTION MAIRIE (RBAC) --- */}
        {isMunicipal && stats && (
          <section className="animate-fade-in-up">
            <div className="flex items-center mb-5">
                <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Health-Score : Vue d'ensemble du parc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* KPI 1 : Health Score */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow">
                <Activity className="w-10 h-10 text-emerald-500 mb-3" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Santé du Parc</h3>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.metrics.health_score_pct}%</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-5">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.metrics.health_score_pct}%` }}></div>
                </div>
              </div>

              {/* KPI 2 : Alertes Actives */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow">
                <ShieldAlert className="w-10 h-10 text-rose-500 mb-3" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dégradations en cours</h3>
                <p className="text-4xl font-extrabold text-rose-600 mt-2">{stats.metrics.active_alerts}</p>
                <div className="mt-4 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">
                  Nécessitent intervention
                </div>
              </div>

              {/* KPI 3 : MTTR */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow">
                <Clock className="w-10 h-10 text-amber-500 mb-3" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Temps de Résolution</h3>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.metrics.avg_resolution_days} j</p>
                <div className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  -15% ce mois
                </div>
              </div>
            </div>

            {/* Heatmap/Top list simulée */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-4">
                 <AlertTriangle className="w-5 h-5 text-gray-400 mr-2"/> Top Dégradations 
               </h3>
               <div className="space-y-5">
                 {stats.heatmap.map((item, index) => (
                   <div key={index} className="flex items-center justify-between group">
                     <span className="text-sm text-gray-700 font-semibold w-1/4">{item.categorie}</span>
                     <div className="flex items-center w-3/4">
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mr-4 overflow-hidden">
                          <div className={`h-2.5 rounded-full ${index === 0 ? 'bg-rose-500' : index === 1 ? 'bg-amber-500' : 'bg-indigo-400'}`} style={{ width: `${(item.count / 6) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded w-10 text-center shadow-sm border border-gray-100">{item.count}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </section>
        )}
        
        {/* --- SECTION CLASSIQUE (COMMUN À TOUS) --- */}
        <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Mes outils rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white hover:bg-gray-50 cursor-pointer rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col items-center text-center transition-colors">
                <User className="w-10 h-10 text-indigo-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Profil Citoyen</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">Gérez vos informations personnelles et préférences.</p>
            </div>

            <Link to="/map" className="bg-white hover:bg-emerald-50 cursor-pointer rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col items-center text-center group transition-colors">
                <MapPin className="w-10 h-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-gray-900">Carte Interactive</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">Découvrez les 5230 équipements certifiés et signalez des incidents en 1 clic.</p>
            </Link>
            </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
