import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Link } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  User, MapPin, AlertTriangle, Settings, Activity, Clock, ShieldAlert,
  TrendingUp, Users, Target, Banknote, Briefcase, MousePointer,
  BarChart4, PieChart, Flame, FileText, X, Eye
} from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States des Modales (Pop-ups de données)
  const [activeModal, setActiveModal] = useState(null); // 'alert', 'top_deg', 'top_freq'

  // Le rôle interne de base. Pour le super_admin, il pourra simuler la vue.
  const [activeRoleView, setActiveRoleView] = useState(user?.role || 'MUNICIPAL_AGENT');

  // Référence pour le conteneur du PDF
  const pdfRef = useRef();

  useEffect(() => {
    // Si l'utilisateur normal (non-super) arrive, forcer sa vue à son rôle.
    if (user?.role && user?.role !== 'SUPER_ADMIN') {
      setActiveRoleView(user.role);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    // On simule un fetch avec le "activeRoleView"
    setTimeout(() => {
      if (activeRoleView === 'MUNICIPAL_AGENT') {
        const marseilleBaseLat = 43.2965;
        const marseilleBaseLng = 5.3698;
        
        setStats({
          metrics: { health_score_pct: 98.4, active_alerts: 12, avg_resolution_days: 2.0 },
          alertes_list: [
            { id: 1, type: 'Dégradation', etat: 'Nouveau', date: '2026-04-21T10:00:00Z', installation__inst_nom: 'Stade Vélodrome' },
            { id: 2, type: 'Éclairage cassé', etat: 'En vérification', date: '2026-04-20T14:30:00Z', installation__inst_nom: 'Gymnase Blancarde' },
            { id: 3, type: 'Poubelles pleines', etat: 'Nouveau', date: '2026-04-22T08:15:00Z', installation__inst_nom: 'City Stade Prado' },
          ],
          heatmap_degradations: Array.from({length: 50}).map((_, i) => ({
            installation__inst_nom: `Terrain ${i}`, count: Math.floor(Math.random() * 5) + 1,
            installation__coordonnees: { lat: marseilleBaseLat + (Math.random() - 0.5)*0.1, lng: marseilleBaseLng + (Math.random() - 0.5)*0.1 }
          })).sort((a,b) => b.count - a.count),
          heatmap_frequentation: Array.from({length: 50}).map((_, i) => ({
            installation__inst_nom: `Skatepark ${i}`, count: Math.floor(Math.random() * 150) + 10,
            installation__coordonnees: { lat: marseilleBaseLat + (Math.random() - 0.5)*0.1, lng: marseilleBaseLng + (Math.random() - 0.5)*0.1 }
          })).sort((a,b) => b.count - a.count)
        });
      } else if (activeRoleView === 'CLUB_MANAGER') {
        setStats({ metrics: { occupancy_rate_pct: 78.5, monthly_revenue_eur: 12450, active_members: 342 }, funnel: { views: 4500, clicks: 1200, bookings: 450, conversion_pct: 10.0 } });
      } else if (activeRoleView === 'ADVERTISER') {
        setStats({ metrics: { total_impressions: 125430, ctr_pct: 4.2, drive_to_store_conversions: 85 }, campaigns: [ { name: "Raquettes Decathlon", clicks: 3200 }, { name: "Events RB", clicks: 2067 } ] });
      } else if (activeRoleView === 'SUPER_ADMIN') {
        setStats({ metrics: { total_users: 18250, total_installations: 5230, mau: 7300, dau: 2700, retention_rate_pct: 68.5, mrr_eur: 32500 } });
      }
      setLoading(false);
    }, 500);
  }, [activeRoleView]);

  const exportPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;
    const originalStyle = input.style.cssText;
    input.style.width = '1200px'; 
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Rapport_Hebdo_KORTA_Mairie.pdf');
    input.style.cssText = originalStyle;
  };

  const getRoleName = (r) => {
    switch(r) {
      case 'SUPER_ADMIN': return "Fondateur / Admin Global";
      case 'MUNICIPAL_AGENT': return "Agent Municipal";
      case 'CLUB_MANAGER': return "Gérant Club Privé";
      case 'ADVERTISER': return "Annonceur Média";
      default: return "Citoyen / Sportif";
    }
  };

  const ModalAlerts = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center"><ShieldAlert className="text-rose-500 mr-2" /> Historique des Alertes Actives</h2>
          <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><X/></button>
        </div>
        <div className="space-y-4">
          {stats?.alertes_list?.map(a => (
            <div key={a.id} className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 text-lg">{a.type}</p>
                <p className="text-sm text-gray-500"><MapPin className="inline w-3 h-3 mr-1"/>{a.installation__inst_nom}</p>
              </div>
              <div className="text-right">
                 <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">{a.etat}</span>
                 <p className="text-xs text-gray-400 mt-2">{new Date(a.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ModalHeatmap = ({ type, title, data, Icon, colorMap }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center"><Icon className={`${colorMap} mr-2`} /> {title} (Étendu)</h2>
          <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><X/></button>
        </div>
        <div className="space-y-3">
          {data?.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50">
              <span className="font-semibold text-gray-800 w-1/2">{i+1}. {item.installation__inst_nom}</span>
              <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded text-gray-700">{item.count} entrées</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {activeModal === 'alert' && <ModalAlerts />}
      {activeModal === 'top_deg' && <ModalHeatmap type="deg" title="Classement Mondial Dégradations" data={stats?.heatmap_degradations} Icon={AlertTriangle} colorMap="text-rose-500" />}
      {activeModal === 'top_freq' && <ModalHeatmap type="freq" title="Classement Mondial Fréquentation" data={stats?.heatmap_frequentation} Icon={Flame} colorMap="text-emerald-500" />}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KORTA Analytics</h1>
              <p className="text-gray-500 mt-1 font-medium">
                Interface de supervision
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {getRoleName(activeRoleView)} {user?.role === 'SUPER_ADMIN' && activeRoleView !== 'SUPER_ADMIN' && "(Vue simulée)"}
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Le Super Admin a un sélecteur de Vue */}
              {user?.role === 'SUPER_ADMIN' && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Eye className="w-4 h-4 text-gray-500 ml-2 mr-1" />
                  <select 
                    value={activeRoleView} 
                    onChange={e => setActiveRoleView(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer"
                  >
                    <option value="SUPER_ADMIN">Vue Globale SportMap</option>
                    <option value="MUNICIPAL_AGENT">Panel Mairie</option>
                    <option value="CLUB_MANAGER">Panel Club</option>
                    <option value="ADVERTISER">Panel Annonceur</option>
                  </select>
                </div>
              )}

              {activeRoleView === 'MUNICIPAL_AGENT' && (
                <button onClick={exportPDF} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 font-bold transition-all disabled:opacity-50">
                  <FileText className="w-4 h-4 mr-2" /> PDF Rapport Hebdo
                </button>
              )}
              <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" ref={pdfRef}>
        
        {loading && <div className="text-center py-20 text-gray-400">Chargement des indicateurs ORM...</div>}

        {/* --- SUPER ADMIN GLOBALE --- */}
        {!loading && activeRoleView === 'SUPER_ADMIN' && stats?.metrics?.mau && (
          <section className="animate-fade-in-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between"><h3 className="text-gray-500 font-bold">Total Utilisateurs</h3><Users className="text-indigo-500"/></div>
              <p className="text-4xl font-black mt-4">{stats.metrics.total_users}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between"><h3 className="text-gray-500 font-bold">Utilisateurs Actifs (MAU)</h3><Activity className="text-emerald-500"/></div>
              <p className="text-4xl font-black mt-4 text-emerald-600">{stats.metrics.mau}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between"><h3 className="text-gray-500 font-bold">Rétention Globale</h3><TrendingUp className="text-blue-500"/></div>
              <p className="text-4xl font-black mt-4">{stats.metrics.retention_rate_pct}%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between"><h3 className="text-gray-500 font-bold">Total Infrastructures</h3><MapPin className="text-amber-500"/></div>
              <p className="text-4xl font-black mt-4">{stats.metrics.total_installations}</p>
            </div>
          </section>
        )}

        {/* --- CLUB_MANAGER --- */}
        {!loading && activeRoleView === 'CLUB_MANAGER' && stats?.metrics?.occupancy_rate_pct && (
          <section className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">Taux d'occupation</h3><p className="text-4xl font-black mt-2">{stats.metrics.occupancy_rate_pct}%</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">Membres Actifs</h3><p className="text-4xl font-black mt-2">{stats.metrics.active_members}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">Revenu (MRR)</h3><p className="text-4xl font-black mt-2 text-emerald-600">{stats.metrics.monthly_revenue_eur} €</p></div>
            </div>
          </section>
        )}

        {/* --- ADVERTISER --- */}
        {!loading && activeRoleView === 'ADVERTISER' && stats?.metrics?.total_impressions && (
          <section className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">Impressions</h3><p className="text-4xl font-black mt-2">{stats.metrics.total_impressions.toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">CTR (Clics)</h3><p className="text-4xl font-black mt-2">{stats.metrics.ctr_pct}%</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-gray-500 font-bold">Drive To Store</h3><p className="text-4xl font-black mt-2 text-amber-600">{stats.metrics.drive_to_store_conversions}</p></div>
            </div>
          </section>
        )}

        {/* --- MAIRIE --- */}
        {!loading && activeRoleView === 'MUNICIPAL_AGENT' && stats?.metrics?.health_score_pct && (
          <section className="animate-fade-in-up bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center"><Activity className="w-6 h-6 text-emerald-600 mr-2"/> Rapport du Parc Municipal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Santé du Parc</h3>
                 <p className="text-4xl font-black text-gray-900 mt-2">{stats.metrics.health_score_pct}%</p>
                 <div className="w-full bg-gray-200 rounded-full h-2 mt-4"><div className="bg-emerald-500 h-2 rounded-full" style={{width:`${stats.metrics.health_score_pct}%`}}></div></div>
              </div>
              
              <div onClick={() => setActiveModal('alert')} className="bg-rose-50 cursor-pointer hover:shadow-lg transition-all rounded-2xl border border-rose-100 p-6 group">
                 <h3 className="text-sm font-semibold text-rose-700 flex justify-between">Alertes Actives <span className="opacity-0 group-hover:opacity-100 text-xs bg-rose-200 text-rose-800 px-2 rounded-full transition-opacity">Voir la liste</span></h3>
                 <p className="text-4xl font-black text-rose-600 mt-2">{stats.metrics.active_alerts}</p>
                 <p className="text-xs text-rose-500 mt-4 bg-rose-100/50 px-2 py-1 rounded inline-block">Interventions requises !</p>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                 <h3 className="text-sm font-semibold text-gray-500">Temps Moyen Résolution</h3>
                 <p className="text-4xl font-black text-amber-500 mt-2">{stats.metrics.avg_resolution_days} j</p>
                 <p className="text-xs text-emerald-600 mt-4 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Très bonne réactivité</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Analyse Spatiale des Zones Chaudes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div onClick={() => setActiveModal('top_deg')} className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:bg-rose-50/30 transition-colors group">
                <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center justify-between">
                  <span className="flex items-center"><AlertTriangle className="w-4 h-4 text-rose-500 mr-2"/> Top Dégradations</span>
                  <span className="text-xs text-rose-600 opacity-0 group-hover:opacity-100">Voir +</span>
                </h3>
                <div className="space-y-3">
                  {stats.heatmap_degradations?.slice(0,5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-semibold truncate w-3/4">{i+1}. {item.installation__inst_nom}</span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 rounded-md">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/60 overflow-hidden h-[300px] relative">
                <Map
                  initialViewState={{ longitude: 5.3698, latitude: 43.2965, zoom: 11 }}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  interactive={true}
                >
                  {stats.heatmap_frequentation?.map((point, index) => {
                    const coords = point.installation__coordonnees;
                    if (!coords?.lng || !coords?.lat) return null;
                    return (
                      <Marker key={`f_${index}`} longitude={coords.lng} latitude={coords.lat}>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_3px_rgba(16,185,129,0.7)] animate-pulse"></div>
                      </Marker>
                    );
                  })}
                  
                  {stats.heatmap_degradations?.map((point, index) => {
                    const coords = point.installation__coordonnees;
                    if (!coords?.lng || !coords?.lat) return null;
                    return (
                      <Marker key={`d_${index}`} longitude={coords.lng} latitude={coords.lat}>
                        <div className="w-5 h-5 bg-rose-500/80 rounded-full border-2 border-white shadow-[0_0_15px_5px_rgba(244,63,94,0.9)] animate-bounce"></div>
                      </Marker>
                    );
                  })}
                </Map>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] p-2 rounded backdrop-blur">
                  🔴 Alertes / 🟢 Fréquentation
                </div>
              </div>

              <div onClick={() => setActiveModal('top_freq')} className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:bg-emerald-50/30 transition-colors group">
                <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center justify-between">
                  <span className="flex items-center"><Flame className="w-4 h-4 text-emerald-500 mr-2"/> Zones Chaudes</span>
                  <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100">Voir +</span>
                </h3>
                <div className="space-y-3">
                  {stats.heatmap_frequentation?.slice(0,5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-semibold truncate w-3/4">{i+1}. {item.installation__inst_nom}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 rounded-md">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
