import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import { 
  User, MapPin, AlertTriangle, Settings, Activity, Clock, ShieldAlert,
  TrendingUp, Users, Target, Banknote, Briefcase, MousePointer,
  BarChart4, PieChart, Flame
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback tempo pour la démo: SUPER_ADMIN, MUNICIPAL_AGENT, CLUB_MANAGER, ADVERTISER, USER
  const role = user?.role || 'SUPER_ADMIN'; 

  useEffect(() => {
    setLoading(true);
    // Simulation structurelle exacte de notre nouvelle API Django ORM
    setTimeout(() => {
      if (role === 'MUNICIPAL_AGENT') {
        setStats({
          metrics: { health_score_pct: 98.4, active_alerts: 12, avg_resolution_days: 2.0 },
          heatmap_degradations: [
            { installation__inst_nom: 'Stade Vélodrome', count: 5 }, 
            { installation__inst_nom: 'Gymnase Blancarde', count: 3 },
            { installation__inst_nom: 'City Stade Prado', count: 2 }
          ],
          heatmap_frequentation: [
            { installation__inst_nom: 'Parc Borély', count: 124 },
            { installation__inst_nom: 'Skatepark Escale', count: 89 },
            { installation__inst_nom: 'Piscine Pointe Rouge', count: 65 }
          ]
        });
      } else if (role === 'CLUB_MANAGER') {
        setStats({
          metrics: { occupancy_rate_pct: 78.5, monthly_revenue_eur: 12450, active_members: 342 },
          funnel: { views: 4500, clicks: 1200, bookings: 450, conversion_pct: 10.0 }
        });
      } else if (role === 'ADVERTISER') {
        setStats({
          metrics: { total_impressions: 125430, ctr_pct: 4.2, drive_to_store_conversions: 85 },
          campaigns: [ { name: "Raquettes Decathlon", clicks: 3200 }, { name: "Events RB", clicks: 2067 } ]
        });
      } else if (role === 'SUPER_ADMIN') {
        setStats({
          metrics: { total_users: 18250, total_installations: 5230, mau: 7300, dau: 2700, retention_rate_pct: 68.5, mrr_eur: 32500 }
        });
      }
      setLoading(false);
    }, 500);
  }, [role]);

  const getRoleName = () => {
    switch(role) {
      case 'SUPER_ADMIN': return "Fondateur / Admin Global";
      case 'MUNICIPAL_AGENT': return "Agent Municipal";
      case 'CLUB_MANAGER': return "Gérant Club Privé";
      case 'ADVERTISER': return "Annonceur Média";
      default: return "Citoyen / Sportif";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KORTA Analytics</h1>
              <p className="text-gray-500 mt-1 font-medium">
                Interface de supervision dédiée
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {getRoleName()}
                </span>
              </p>
            </div>
            <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {loading && <div className="text-center py-20 text-gray-400">Chargement des indicateurs...</div>}

        {/* --- MAIRIE (Adapté aux vraies structures Backend) --- */}
        {!loading && (role === 'MUNICIPAL_AGENT' || role === 'SUPER_ADMIN') && stats?.metrics?.health_score_pct && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center"><Activity className="w-5 h-5 text-emerald-600 mr-2"/> Vue Parc Public</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Santé du Parc</h3>
                 <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.metrics.health_score_pct}%</p>
                 <div className="w-full bg-gray-100 rounded-full h-2 mt-4"><div className="bg-emerald-500 h-2 rounded-full" style={{width:`${stats.metrics.health_score_pct}%`}}></div></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Alertes Actives</h3>
                 <p className="text-4xl font-extrabold text-rose-600 mt-2">{stats.metrics.active_alerts}</p>
                 <p className="text-xs text-rose-500 mt-4 bg-rose-50 px-2 py-1 rounded inline-block">Interventions requises</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Temps Moyen de Résolution</h3>
                 <p className="text-4xl font-extrabold text-amber-500 mt-2">{stats.metrics.avg_resolution_days} j</p>
              </div>
            </div>

            {/* HEATMAPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500 mr-2"/> Top Dégradations (Terrains touchés)
                </h3>
                <div className="space-y-4">
                  {stats.heatmap_degradations?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-semibold truncate w-1/2">{item.installation__inst_nom}</span>
                      <div className="flex items-center w-1/2">
                          <div className="w-full bg-gray-100 rounded-full h-2 mr-3"><div className="bg-rose-500 h-2 rounded-full" style={{width:`${(item.count/5)*100}%`}}></div></div>
                          <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2 py-1 rounded">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-4">
                  <Flame className="w-5 h-5 text-emerald-500 mr-2"/> Top Fréquentation (Check-ins)
                </h3>
                <div className="space-y-4">
                  {stats.heatmap_frequentation?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-semibold truncate w-1/2">{item.installation__inst_nom}</span>
                      <div className="flex items-center w-1/2">
                          <div className="w-full bg-gray-100 rounded-full h-2 mr-3"><div className="bg-emerald-500 h-2 rounded-full" style={{width:`${Math.min((item.count/150)*100, 100)}%`}}></div></div>
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- CLUBS PRIVÉS (Inchangé) --- */}
        {!loading && (role === 'CLUB_MANAGER' || role === 'SUPER_ADMIN') && stats?.metrics?.occupancy_rate_pct && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center"><Target className="w-5 h-5 text-indigo-600 mr-2"/> Performances du Club Privé</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Taux d'occupation</h3>
                 <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.metrics.occupancy_rate_pct}%</p>
                 <div className="w-full bg-gray-100 rounded-full h-2 mt-4"><div className="bg-indigo-500 h-2 rounded-full" style={{width:`${stats.metrics.occupancy_rate_pct}%`}}></div></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Chiffre d'Affaires</h3>
                 <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.metrics.monthly_revenue_eur} €</p>
                 <p className="text-xs text-emerald-600 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +12% ce mois</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Réservations validées</h3>
                 <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.funnel.bookings}</p>
                 <p className="text-xs text-gray-500 mt-2">Conversion: {stats.funnel.conversion_pct}%</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Membres Actifs</h3>
                 <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.metrics.active_members}</p>
              </div>
            </div>
          </section>
        )}

        {/* --- ANNONCEURS (Inchangé) --- */}
        {!loading && (role === 'ADVERTISER' || role === 'SUPER_ADMIN') && stats?.metrics?.total_impressions && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center"><Briefcase className="w-5 h-5 text-amber-500 mr-2"/> Campagnes Sponsoring Mapbox</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl shadow-md p-6 text-white text-center">
                 <MousePointer className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                 <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Impressions Globales</h3>
                 <p className="text-4xl font-extrabold mt-2">{stats.metrics.total_impressions.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 text-center">
                 <BarChart4 className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">CTR (Taux de clic)</h3>
                 <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.metrics.ctr_pct}%</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 text-center border-b-4 border-b-emerald-500">
                 <MapPin className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                 <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Drive-to-Store (Check-ins)</h3>
                 <p className="text-4xl font-extrabold text-emerald-600 mt-2">{stats.metrics.drive_to_store_conversions}</p>
              </div>
            </div>
          </section>
        )}

        {/* --- SUPER ADMIN ONLY (Inchangé) --- */}
        {!loading && role === 'SUPER_ADMIN' && stats?.metrics?.mau && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center"><PieChart className="w-5 h-5 text-rose-600 mr-2"/> KPI KORTA (Global Start-up)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 bg-rose-50/50">
                 <h3 className="text-sm font-semibold text-rose-800">Total Utilisateurs</h3>
                 <p className="text-3xl font-extrabold text-rose-600 mt-2">{stats.metrics.total_users.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">MAU (Monthly Actives)</h3>
                 <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.metrics.mau.toLocaleString()}</p>
                 <p className="text-xs text-gray-500 mt-2">DAU: {stats.metrics.dau.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Taux de rétention</h3>
                 <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.metrics.retention_rate_pct}%</p>
                 <p className="text-xs text-emerald-600 mt-2">Critique (au-dessus de 60%)</p>
              </div>
              <div className="bg-gray-900 rounded-2xl shadow-m p-6 text-white border border-gray-800 relative overflow-hidden">
                 <Banknote className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-gray-800 opacity-50" />
                 <h3 className="text-sm font-semibold text-gray-400 relative z-10">MRR (Abonnements + Ads)</h3>
                 <p className="text-3xl font-extrabold text-emerald-400 mt-2 relative z-10">{stats.metrics.mrr_eur.toLocaleString()} €</p>
              </div>
            </div>
          </section>
        )}

        {/* --- OUTILS CITOYEN EN BAS (COMMUN) --- */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Vue Utilisateur Standard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/map" className="bg-white hover:bg-emerald-50 cursor-pointer rounded-2xl shadow-sm border border-gray-200/60 p-6 flex items-center group transition-colors">
              <MapPin className="w-12 h-12 text-emerald-500 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ouvrir la Carte</h3>
                <p className="text-sm text-gray-500">Explorer les équipements et clubs KORTA.</p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
