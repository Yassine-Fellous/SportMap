const API_BASE_URL = import.meta.env.VITE_API_URL;

// Mode de test - désactivé pour utiliser l'API réelle
const MOCK_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true';

class ReportService {
  // Simulation d'un délai réseau
  async mockDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Vérifier si l'utilisateur est connecté
  isUserAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Récupérer les données utilisateur
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur parsing user data:', error);
      return null;
    }
  }

  async submitReport(reportData) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Submit report avec:', reportData);
      
      // Simuler un délai réseau
      await this.mockDelay(2000);
      
      // Simuler différents scénarios selon le type de problème
      if (reportData.type === 'Problème de sécurité') {
        // Simuler une erreur pour ce type
        throw new Error('Erreur lors de l\'envoi du signalement de sécurité');
      }
      
      if (reportData.message.includes('erreur')) {
        throw new Error('Message invalide détecté');
      }
      
      // Simuler succès
      const mockResponse = {
        id: Math.floor(Math.random() * 1000) + 1,
        message: "Signalement créé"
      };
      
      console.log('✅ Signalement créé avec succès:', mockResponse);
      return mockResponse;
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.isUserAuthenticated()) {
      throw new Error('Vous devez être connecté pour envoyer un signalement.');
    }

    // Appel API réel
    try {
      const token = localStorage.getItem('authToken');
      const user = this.getCurrentUser();

      console.log('📤 Envoi vers API:', `${API_BASE_URL}/signalements/create/`);
      console.log('📋 Données originales:', reportData);
      console.log('👤 Utilisateur:', user?.email);

      const backendData = {
        installation_id: reportData.installation, // ✅ Directement l'ID auto-incrémenté
        message: reportData.message,
        images_url: reportData.images_url,
        type: reportData.type
      };

      console.log('📋 Données envoyées (ID direct):', backendData);

      // Validation simple
      if (!backendData.installation_id && backendData.installation_id !== 0) {
        throw new Error('ID d\'installation manquant');
      }

      // Conversion en nombre si nécessaire
      if (typeof backendData.installation_id === 'string') {
        backendData.installation_id = parseInt(backendData.installation_id);
        
        if (isNaN(backendData.installation_id)) {
          throw new Error('ID d\'installation invalide');
        }
      }

      console.log('✅ Envoi avec installation_id:', backendData.installation_id);

      const response = await fetch(`${API_BASE_URL}/signalements/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendData)
      });

      console.log('📥 Réponse status:', response.status);

      if (!response.ok) {
        // Gestion spécifique des erreurs d'authentification
        if (response.status === 401) {
          // Token invalide ou expiré - déconnecter l'utilisateur
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        if (response.status === 405) {
          throw new Error('Méthode non autorisée');
        }

        if (response.status === 400) {
          throw new Error('Données manquantes: installation_id et message requis');
        }

        if (response.status === 404) {
          throw new Error('Installation introuvable');
        }

        if (response.status === 500) {
          throw new Error('Erreur serveur interne');
        }

        // Tenter de parser la réponse d'erreur
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            console.log('❌ Erreur API:', errorData);
            
            throw new Error(errorData.error || 'Erreur lors de l\'envoi du signalement');
          } catch (jsonError) {
            if (jsonError.message.includes('JSON')) {
              throw new Error(`Erreur serveur ${response.status}: ${response.statusText}`);
            }
            throw jsonError;
          }
        } else {
          // Réponse non-JSON
          const textResponse = await response.text();
          throw new Error(`Erreur ${response.status}: ${textResponse || response.statusText}`);
        }
      }

      // Vérifier si la réponse contient du JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Signalement créé:', data);
        return data;
      } else {
        // Si pas de JSON, retourner un objet de succès basique
        console.log('✅ Signalement envoyé (réponse non-JSON)');
        return {
          success: true,
          message: 'Signalement envoyé avec succès',
          id: Date.now() // ID temporaire
        };
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du signalement:', error);
      
      // Améliorer les messages d'erreur pour l'utilisateur
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
      }
      
      if (error.name === 'SyntaxError') {
        throw new Error('Erreur de communication avec le serveur.');
      }
      
      throw error;
    }
  }

  async uploadImages(images) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Upload images:', images.length, 'images');
      await this.mockDelay(1500);
      
      const mockUrls = images.map((_, index) => 
        `https://res.cloudinary.com/dzpsl9lfc/image/upload/v1234567890/sportmap/reports/mock_image_${index}.jpg`
      );
      
      console.log('✅ Images uploadées (mock):', mockUrls);
      return mockUrls.join(',');
    }

    if (images.length === 0) return null;

    try {
      console.log('📤 Upload vers Cloudinary...');
      
      // ✅ IMPORT DYNAMIQUE DU SERVICE CLOUDINARY
      const { default: cloudinaryService } = await import('./cloudinary.js');
      
      // ✅ UPLOAD VIA CLOUDINARY
      const uploadResults = await cloudinaryService.uploadMultipleImages(images);
      
      // ✅ EXTRAIRE LES URLs POUR LE BACKEND
      const urls = cloudinaryService.extractUrls(uploadResults);
      
      console.log('✅ URLs Cloudinary récupérées:', urls);
      
      return urls;
      
    } catch (error) {
      console.error('❌ Erreur upload Cloudinary:', error);
      
      // ✅ GESTION GRACIEUSE - CONTINUER SANS IMAGES
      console.warn('⚠️ Poursuite sans images à cause de l\'erreur d\'upload');
      return null;
    }
  }

  // Pas d'endpoint pour récupérer les signalements utilisateur dans votre backend actuel
  async getUserReports() {
    if (MOCK_MODE) {
      await this.mockDelay(1000);
      return [
        {
          id: 1,
          message: 'Terrain de basket endommagé',
          type: 'Équipement endommagé',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.isUserAuthenticated()) {
      throw new Error('Vous devez être connecté pour voir vos signalements.');
    }

    // Pour l'instant, pas d'endpoint dans votre backend
    console.warn('⚠️ Endpoint getUserReports pas encore implémenté dans le backend');
    return [];

    // Si vous voulez implémenter plus tard :
    /*
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/signalements/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors de la récupération des signalements');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erreur récupération signalements:', error);
      throw error;
    }
    */
  }

  // Méthode utilitaire pour vérifier l'état de connexion
  getAuthenticationStatus() {
    const isAuthenticated = this.isUserAuthenticated();
    const user = this.getCurrentUser();
    
    return {
      isAuthenticated,
      user,
      message: isAuthenticated 
        ? `Connecté en tant que ${user?.email}` 
        : 'Non connecté'
    };
  }
}

export const reportService = new ReportService();
export { MOCK_MODE };

