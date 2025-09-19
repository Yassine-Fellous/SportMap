import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CODE_LENGTH = 6;

const VerificationPage = () => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode } = useAuth();
  
  const email = location.state?.email || '';
  const redirect = location.state?.redirect || '';
  const inputs = useRef([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    
    if (val && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
    
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    const newCode = Array(CODE_LENGTH).fill('');
    
    for (let i = 0; i < pastedData.length && i < CODE_LENGTH; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    const focusIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
    inputs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== CODE_LENGTH) {
      setError('Veuillez saisir le code complet');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await verifyEmail(verificationCode, email);
      
      setIsSuccess(true);
      setMessage(response.message || 'Email vérifié avec succès !');
      
      // Redirection selon le contexte
      setTimeout(() => {
        if (response.token) {
          // Si un token est retourné, l'utilisateur est connecté
          if (redirect === 'report') {
            navigate('/report', { replace: true });
          } else {
            navigate('/map', { 
              replace: true,
              state: { 
                message: 'Compte créé et vérifié avec succès ! Bienvenue sur SportMap.',
                type: 'success'
              }
            });
          }
        } else {
          // Sinon, rediriger vers la connexion
          navigate('/login', {
            replace: true,
            state: {
              message: 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.',
              type: 'success'
            }
          });
        }
      }, 2000);

    } catch (err) {
      console.error('Erreur vérification:', err);
      setError(err.message || 'Code de vérification incorrect');
      
      setCode(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await resendVerificationCode(email);
      setMessage('Code renvoyé avec succès !');
      setResendCooldown(60);
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Email vérifié !
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin h-5 w-5 text-blue-500" />
            <span className="ml-2 text-gray-600">Redirection en cours...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Vérifiez votre email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Un code de vérification à 6 chiffres a été envoyé à
          </p>
          <p className="font-medium text-blue-600">{email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Code de vérification
              </label>
              <div className="flex justify-center gap-3 mb-4">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => (inputs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                    required
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <FaCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || code.join('').length !== CODE_LENGTH}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  Vérification...
                </div>
              ) : (
                'Vérifier le code'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Vous n'avez pas reçu le code ?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSubmitting || resendCooldown > 0}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 
                  ? `Renvoyer le code (${resendCooldown}s)`
                  : 'Renvoyer le code'
                }
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link 
            to="/register" 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à l'inscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;