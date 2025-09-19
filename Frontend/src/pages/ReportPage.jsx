import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Send, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { reportService } from '../services/api/reportService';

const ReportPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();
    
    // ✅ ID DIRECTEMENT AUTO-INCRÉMENTÉ
    const equipmentId = searchParams.get('equipmentId');
    const equipmentName = searchParams.get('equipmentName');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const address = searchParams.get('address');

    console.log('🔍 ID équipement reçu (auto-incrémenté):', equipmentId);

    // États
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formCompleted, setFormCompleted] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    const [formData, setFormData] = useState({
        message: '',
        type: '',
        images: [],
        installationId: equipmentId ? parseInt(equipmentId) : null, // ✅ DIRECTEMENT L'ID
        installationName: equipmentName || ''
    });

    // Si l'utilisateur se connecte et que le formulaire était complété, soumettre automatiquement
    useEffect(() => {
        if (isAuthenticated && formCompleted && showAuthPrompt) {
            setShowAuthPrompt(false);
            submitFormData();
        }
    }, [isAuthenticated, formCompleted, showAuthPrompt]);

    // Restaurer le formulaire depuis sessionStorage si disponible
    useEffect(() => {
        const pendingReport = sessionStorage.getItem('pendingReport');
        if (pendingReport) {
            try {
                const { formData: savedFormData } = JSON.parse(pendingReport);
                setFormData(prev => ({ ...prev, ...savedFormData }));
                sessionStorage.removeItem('pendingReport');
            } catch (error) {
                console.error('Error restoring pending report:', error);
                sessionStorage.removeItem('pendingReport');
            }
        }
    }, []);

    // Rediriger vers la connexion avec le formulaire en mémoire
    const handleLoginRedirect = () => {
        // Sauvegarder le formulaire dans sessionStorage
        sessionStorage.setItem('pendingReport', JSON.stringify({
            formData,
            equipmentId,
            equipmentName
        }));
        
        // Rediriger vers la page de connexion avec paramètre redirect
        navigate('/login?redirect=report');
    };

    // Rediriger vers l'inscription
    const handleRegisterRedirect = () => {
        // Sauvegarder le formulaire dans sessionStorage
        sessionStorage.setItem('pendingReport', JSON.stringify({
            formData,
            equipmentId,
            equipmentName
        }));
        
        // Rediriger vers la page d'inscription avec paramètre redirect
        navigate('/register?redirect=report');
    };

    // Types de problèmes correspondant au champ 'type' du modèle
    const problemTypes = [
        { value: 'Équipement endommagé', label: 'Équipement endommagé' },
        { value: 'Problème de maintenance', label: 'Problème de maintenance' },
        { value: 'Problème de sécurité', label: 'Problème de sécurité (TEST ERREUR)' },
        { value: 'Problème de propreté', label: 'Problème de propreté' },
        { value: 'Problème d\'accès', label: 'Problème d\'accès' },
        { value: 'Problème d\'éclairage', label: 'Problème d\'éclairage' },
        { value: 'Surface dégradée', label: 'Surface dégradée' },
        { value: 'Autre', label: 'Autre problème' }
    ];

    // Handle image upload
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        
        console.log('📸 Fichiers sélectionnés:', files.length);
        
        if (files.length === 0) return;

        const maxSize = 5 * 1024 * 1024;
        const maxFiles = 3;

        if (formData.images.length + files.length > maxFiles) {
            setErrors(prev => ({ ...prev, images: `Maximum ${maxFiles} images autorisées` }));
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                setErrors(prev => ({ ...prev, images: 'Fichier trop volumineux (max 5MB)' }));
                return false;
            }
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, images: 'Seules les images sont autorisées' }));
                return false;
            }
            return true;
        });

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, {
                        // ✅ STRUCTURE CORRECTE POUR CLOUDINARY
                        file: file, // Le vrai fichier File
                        preview: e.target.result, // Pour l'affichage
                        id: Date.now() + Math.random()
                    }]
                }));
            };
            reader.readAsDataURL(file);
        });

        setErrors(prev => ({ ...prev, images: '' }));
    };

    // Remove image
    const removeImage = (imageId) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.type) {
            newErrors.type = 'Veuillez sélectionner un type de problème';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Veuillez décrire le problème';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Description trop courte (minimum 10 caractères)';
        }

        // Debug avant validation de l'ID
        console.log('🔍 VALIDATION DEBUG:', {
            'formData.installationId': formData.installationId,
            'typeof formData.installationId': typeof formData.installationId,
            'equipmentId (URL)': equipmentId,
            'typeof equipmentId': typeof equipmentId,
            'formData complet': formData
        });

        const installationId = formData.installationId || equipmentId;
        
        if (!installationId) {
            newErrors.submit = 'ID d\'installation manquant. Veuillez sélectionner un équipement depuis la carte.';
            console.error('❌ Installation ID manquant en validation:', {
                'formData.installationId': formData.installationId,
                'equipmentId': equipmentId,
                'installationId calculé': installationId,
                'formData': formData
            });
        } else {
            console.log('✅ Installation ID trouvé:', installationId);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumettre les données du formulaire
    const submitFormData = async () => {
        setIsSubmitting(true);
        setErrors({});

        try {
            console.log('🚀 Début de soumission du formulaire...');

            const finalInstallationId = formData.installationId;
            
            if (!finalInstallationId) {
                setErrors(prev => ({
                    ...prev,
                    submit: 'Erreur: ID d\'installation manquant.'
                }));
                return;
            }

            // Upload des images si présentes
            let imagesUrl = null;
            if (formData.images.length > 0) {
                console.log('📸 Upload des images...');
                imagesUrl = await reportService.uploadImages(formData.images);
            }

            // ✅ DONNÉES DIRECTES - PLUS DE CONVERSION
            const reportData = {
                installation: finalInstallationId, // Directement l'ID auto-incrémenté !
                message: formData.message.trim(),
                images_url: imagesUrl,
                type: formData.type
            };

            console.log('📤 Données envoyées au backend:', reportData);

            const response = await reportService.submitReport(reportData);
            
            console.log('✅ Réponse reçue:', response);

            // Nettoyer le sessionStorage
            sessionStorage.removeItem('pendingReport');

            // ✅ REDIRECTION VERS LA PAGE DE SUCCÈS
            navigate('/report-success', { 
              replace: true,
              state: { 
                id: response.id,
                equipmentName: formData.installationName,
                type: formData.type,
                message: 'Signalement envoyé avec succès !'
              }
            });

        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Erreur lors de l\'envoi du signalement'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📝 Soumission du formulaire...');
        console.log('📊 Données actuelles:', formData);
        console.log('🔐 Authentifié:', isAuthenticated);

        if (!validateForm()) {
            console.log('❌ Validation échouée');
            return;
        }

        // Si l'utilisateur est déjà connecté, soumettre directement
        if (isAuthenticated) {
            console.log('✅ Utilisateur connecté, soumission directe');
            await submitFormData();
            return;
        }

        // Sinon, marquer le formulaire comme complété et demander l'authentification
        console.log('🔑 Authentification requise');
        setFormCompleted(true);
        setShowAuthPrompt(true);
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Debug initial (garder)
    useEffect(() => {
        console.log('🔍 DEBUG - Paramètres URL:', {
            equipmentId,
            equipmentName,
            lat,
            lng,
            address
        });
    }, [equipmentId, equipmentName, lat, lng, address]);

    // Debug formData (simplifier)
    useEffect(() => {
        console.log('🔍 DEBUG - FormData actuel:', formData);
    }, [formData]);

    // Supprimer ce useEffect qui crée des conflits :
    /*
    useEffect(() => {
        if (equipmentId && !formData.installationId) {
            console.log('🔄 Initialisation depuis URL:', equipmentId);
            setFormData(prev => ({
                ...prev,
                installationId: equipmentId,
                installationName: equipmentName || ''
            }));
        }
    }, [equipmentId, equipmentName]);
    */

    // Garder seulement le debug :
    useEffect(() => {
        console.log('🔍 DEBUG - Valeurs actuelles:', {
            'equipmentId (URL)': equipmentId,
            'formData.installationId': formData.installationId,
            'equipmentName': equipmentName,
            'formData.installationName': formData.installationName
        });
    }, [equipmentId, equipmentName, formData.installationId, formData.installationName]);

    // Restauration sessionStorage (garder)
    useEffect(() => {
        const pendingReport = sessionStorage.getItem('pendingReport');
        if (pendingReport) {
            try {
                const { formData: savedFormData } = JSON.parse(pendingReport);
                setFormData(prev => ({ ...prev, ...savedFormData }));
                sessionStorage.removeItem('pendingReport');
            } catch (error) {
                console.error('Error restoring pending report:', error);
                sessionStorage.removeItem('pendingReport');
            }
        }
    }, []);

    // Auto-submit après connexion (garder)
    useEffect(() => {
        if (isAuthenticated && formCompleted && showAuthPrompt) {
            setShowAuthPrompt(false);
            submitFormData();
        }
    }, [isAuthenticated, formCompleted, showAuthPrompt]);

    // Redirection si pas d'ID (garder)
    useEffect(() => {
        if (!equipmentId && !formData.installationId) {
            console.error('❌ Aucun ID d\'équipement fourni');
            navigate('/map', {
                state: {
                    message: 'Veuillez sélectionner un équipement depuis la carte pour faire un signalement.',
                    type: 'error'
                }
            });
        }
    }, [equipmentId, formData.installationId, navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Signaler un problème
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Authentication Prompt */}
                {showAuthPrompt && !isAuthenticated ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="mb-6">
                            <AlertTriangle className="w-20 h-20 mx-auto text-blue-500 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                Presque terminé !
                            </h2>
                            <p className="text-gray-600 text-lg mb-8">
                                Votre signalement est prêt. Pour l'envoyer, vous devez vous connecter ou créer un compte.
                            </p>
                        </div>
                        
                        <div className="space-y-4 max-w-sm mx-auto">
                            <button
                                onClick={handleLoginRedirect}
                                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                <LogIn className="w-5 h-5 mr-3" />
                                Se connecter
                            </button>
                            
                            <button
                                onClick={handleRegisterRedirect}
                                className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                <UserPlus className="w-5 h-5 mr-3" />
                                Créer un compte
                            </button>
                            
                            <button
                                onClick={() => setShowAuthPrompt(false)}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Retour au formulaire
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Formulaire */
                    <div className="bg-white rounded-lg shadow-sm">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Debug Info (en mode développement) */}
                            {import.meta.env.DEV && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                    <p><strong>🧪 Mode Debug:</strong></p>
                                    <p>Authentifié: {isAuthenticated ? '✅' : '❌'}</p>
                                    <p>Email utilisateur: {user?.email || 'Non connecté'}</p>
                                    <p>Installation ID (formData): {formData.installationId || 'Aucune'}</p>
                                    <p>Installation ID (URL): {equipmentId || 'Aucune'}</p>
                                    <p>Installation ID calculé: {formData.installationId || equipmentId || 'Aucune'}</p>
                                    <p>Nom installation: {formData.installationName || 'Aucun'}</p>
                                    <p>Message: {formData.message.length} caractères</p>
                                    <p>Type: {formData.type || 'Non sélectionné'}</p>
                                    
                                    {/* Bouton de test */}
                                    <div className="mt-2 space-x-2">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                console.log('🧪 TEST - État actuel:', formData);
                                                console.log('🧪 TEST - Validation:', validateForm());
                                            }}
                                            className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                                        >
                                            🧪 Test validation
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    installationId: equipmentId || '123',
                                                    installationName: equipmentName || 'Test Equipment'
                                                }));
                                            }}
                                            className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                                        >
                                            🔧 Forcer ID
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* User Info Display (if authenticated) */}
                            {isAuthenticated && user && (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm font-medium text-green-800">
                                        Connecté en tant que: {user?.email}
                                    </p>
                                </div>
                            )}

                            {/* Equipment Info (if provided) */}
                            {formData.installationName && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">
                                                Signalement pour :
                                            </p>
                                            <p className="text-blue-700">{formData.installationName}</p>
                                            {formData.installationId && (
                                                <p className="text-xs text-blue-600">ID: {formData.installationId}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Type de problème */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Quel est le problème ? *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500  bg-white text-gray-700 ${
                                        errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="" className="text-black">Sélectionnez le type de problème</option>
                                    {problemTypes.map(type => (
                                        <option key={type.value} value={type.value} className="text-black">
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Décrivez le problème *
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    placeholder="Expliquez en détail ce qui ne va pas avec cet équipement... (Tapez 'erreur' pour tester la gestion d'erreur)"
                                    rows={5}
                                    maxLength={1000}
                                    className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base bg-white text-black ${
                                        errors.message ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <div className="flex justify-between mt-2">
                                    {errors.message && (
                                        <p className="text-sm text-red-600">{errors.message}</p>
                                    )}
                                    <p className="text-sm text-gray-500 ml-auto">
                                        {formData.message.length}/1000
                                    </p>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Photos (optionnel)
                                </label>
                                <p className="text-sm text-gray-500 mb-3">
                                    Ajoutez jusqu'à 3 photos pour illustrer le problème
                                </p>
                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={formData.images.length >= 3}
                                    />
                                    
                                    {formData.images.length < 3 && (
                                        <label
                                            htmlFor="image-upload"
                                            className="w-full flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
                                        >
                                            <Camera className="w-6 h-6 mr-3 text-gray-400" />
                                            <span className="text-gray-600 text-base">
                                                {formData.images.length === 0 
                                                    ? 'Ajouter des photos' 
                                                    : `Ajouter une photo (${formData.images.length}/3)`
                                                }
                                            </span>
                                        </label>
                                    )}

                                    {/* Image Previews */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {formData.images.map(image => (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={image.preview}
                                                        alt="Preview"
                                                        className="w-full h-40 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(image.id)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.images && (
                                        <p className="text-sm text-red-600">{errors.images}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Envoi en cours...
                                        </div>
                                    ) : isAuthenticated ? (
                                        <>
                                            <Send className="w-5 h-5 mr-3" />
                                            Envoyer le signalement
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-3" />
                                            Continuer vers la connexion
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* 🧪 BOUTON DEBUG CLOUDINARY */}
                            <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">🧪 Debug Cloudinary</h4>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        console.log('🔍 Variables d\'environnement:');
                                        console.log('CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
                                        console.log('UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                                        console.log('API_KEY:', import.meta.env.VITE_CLOUDINARY_API_KEY);
                                        
                                        try {
                                            const { default: cloudinaryService } = await import('../services/api/cloudinary.js');
                                            console.log('📋 Config service:', cloudinaryService.getDebugInfo());
                                            
                                            // Test avec image minimale
                                            const canvas = document.createElement('canvas');
                                            canvas.width = 100;
                                            canvas.height = 100;
                                            const ctx = canvas.getContext('2d');
                                            ctx.fillStyle = '#ff0000';
                                            ctx.fillRect(0, 0, 100, 100);
                                            
                                            canvas.toBlob(async (blob) => {
                                                const testFile = {
                                                    file: new File([blob], 'test.png', { type: 'image/png' })
                                                };
                                                
                                                console.log('📤 Test upload direct...');
                                                try {
                                                    const result = await cloudinaryService.uploadImage(testFile);
                                                    console.log('✅ Upload réussi:', result);
                                                    alert('✅ Test Cloudinary réussi ! URL: ' + result.url);
                                                } catch (error) {
                                                    console.error('❌ Erreur upload:', error);
                                                    alert('❌ Erreur: ' + error.message);
                                                }
                                            });
                                        } catch (error) {
                                            console.error('❌ Erreur service:', error);
                                            alert('❌ Erreur service: ' + error.message);
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Test Cloudinary Direct
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;