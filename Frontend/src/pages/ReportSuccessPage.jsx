import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MapPin } from 'lucide-react';

const ReportSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les données du signalement depuis l'état
  const reportData = location.state;

  // Redirection immédiate si pas de données
  useEffect(() => {
    if (!reportData) {
      navigate('/map', { replace: true });
    }
  }, [reportData, navigate]);

  const handleReturnToMap = () => {
    navigate('/map', { 
      replace: true,
      state: {
        message: 'Signalement envoyé avec succès !',
        type: 'success'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Signalement envoyé !
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Votre signalement a bien été enregistré. Merci de contribuer à l'amélioration des équipements sportifs.
          </p>
        </div>

        {/* Report Details */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Détails du signalement
            </h2>
            
            {reportData.equipmentName && (
              <div>
                <p className="text-sm font-medium text-gray-700">Équipement :</p>
                <p className="text-gray-600">{reportData.equipmentName}</p>
              </div>
            )}
            
            {reportData.type && (
              <div>
                <p className="text-sm font-medium text-gray-700">Type de problème :</p>
                <p className="text-gray-600">{reportData.type}</p>
              </div>
            )}
            
            {reportData.id && (
              <div>
                <p className="text-sm font-medium text-gray-700">Numéro de signalement :</p>
                <p className="text-gray-600">#{reportData.id}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleReturnToMap}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <MapPin className="w-5 h-5 mr-3" />
            Retour à la carte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportSuccessPage;