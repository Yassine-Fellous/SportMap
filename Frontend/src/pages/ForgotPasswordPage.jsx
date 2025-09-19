import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { AlertTriangle, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // ✅ CORRIGER L'URL - UTILISER L'API BACKEND RÉELLE
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cdabackend-production-3c8a.up.railway.app';
      
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      console.log('📥 Réponse status:', response.status);
      console.log('📥 Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        // ✅ VÉRIFIER LE CONTENT-TYPE AVANT DE PARSER
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Une erreur est survenue');
        } else {
          // Réponse non-JSON (HTML, text, etc.)
          const textResponse = await response.text();
          console.error('❌ Réponse non-JSON:', textResponse);
          throw new Error(`Erreur serveur ${response.status}`);
        }
      }

      // ✅ VÉRIFIER LE CONTENT-TYPE POUR LA RÉPONSE DE SUCCÈS AUSSI
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Réponse reçue:', data);
      }

      // Succès
      setIsSuccess(true);
      
    } catch (err) {
      console.error('❌ Erreur mot de passe oublié:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  // Vue de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Email envoyé !
            </h2>
            <p className="text-gray-600 mb-8">
              Si un compte existe avec l'adresse <strong>{email}</strong>, 
              vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Vérifiez votre boîte mail
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    L'email peut prendre quelques minutes à arriver. 
                    Pensez à vérifier votre dossier spam.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Renvoyer l'email
                </button>
                
                <Link
                  to="/login"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vue du formulaire
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="votre@email.com"
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  required
                />
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pour des raisons de sécurité, nous n'indiquons pas si cette adresse email 
                    existe dans notre système. Si elle existe, vous recevrez un email.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi en cours...
                </div>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>

            {/* Back to login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                <FaArrowLeft className="mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>

        {/* Register link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;