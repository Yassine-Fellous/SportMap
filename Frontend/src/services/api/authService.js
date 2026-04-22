const API_BASE_URL = import.meta.env.VITE_API_URL;

// Mode de test - désactivé pour utiliser l'API réelle
let MOCK_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true';

class AuthService {
  async mockDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Login avec:', credentials);
      await this.mockDelay(1500);
      
      if (credentials.email === 'error@test.com') {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      return {
        token: 'mock_token_123',
        user: {
          id: 1,
          email: credentials.email,
          verified: true
        }
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 403) {
          throw new Error('Compte non validé. Vérifiez votre email.');
        } else if (response.status === 401) {
          throw new Error('Mot de passe incorrect');
        } else if (response.status === 404) {
          throw new Error('Aucun compte trouvé avec cet email');
        }
        
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const data = await response.json();
      console.log('✅ Connexion réussie:', data);
      
      return {
        token: data.token,
        user: data.user || {
          email: credentials.email,
          verified: true
        }
      };

    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error;
    }
  }

  async register(userData) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Register avec:', userData);
      await this.mockDelay(2000);
      
      if (userData.email === 'taken@test.com') {
        throw new Error('Cette adresse email est déjà utilisée');
      }
      
      return {
        message: 'Code envoyé par email'
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          throw new Error('Email et mot de passe requis');
        } else if (response.status === 409) {
          throw new Error('Cette adresse email est déjà utilisée');
        }
        
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      console.log('✅ Inscription réussie:', data);
      
      return {
        message: data.message || 'Code envoyé par email'
      };

    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  async verifyEmail(code, email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Verify email:', { code, email });
      await this.mockDelay(1000);
      
      if (code !== '123456') {
        throw new Error('Code de vérification incorrect');
      }
      
      return {
        message: 'Compte validé',
        token: 'mock_token_123',
        user: {
          email: email,
          verified: true
        }
      };
    }

    // Appel API réel
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: code.trim(),
          email: email.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          throw new Error('Code de vérification incorrect');
        } else if (response.status === 404) {
          throw new Error('Utilisateur non trouvé');
        }
        
        throw new Error(errorData.error || 'Erreur de vérification');
      }

      const data = await response.json();
      console.log('✅ Vérification réussie:', data);
      
      // Après vérification réussie, connecter automatiquement l'utilisateur
      // On peut soit faire un login automatique, soit retourner un token si l'API le fournit
      return {
        message: data.message || 'Compte validé',
        // Note: Votre API Django ne retourne pas de token après vérification
        // Vous pourriez vouloir modifier l'API pour en retourner un
        user: {
          email: email,
          verified: true
        }
      };

    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      throw error;
    }
  }

  async resendVerificationCode(email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Resend code pour:', email);
      await this.mockDelay(1000);
      return { message: 'Code renvoyé avec succès' };
    }

    try {
      console.log('📤 Renvoi code vers:', `${API_BASE_URL}/auth/resend-verification-code/`);
      
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim()
        }),
      });

      console.log('📥 Renvoi code status:', response.status);

      if (!response.ok) {
        let errorMessage;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Erreur lors du renvoi du code';
        } catch {
          errorMessage = `Erreur serveur ${response.status}`;
        }
        
        console.error('❌ Erreur renvoi code:', errorMessage);
        throw new Error(errorMessage);
      }

      // ✅ SUCCÈS - PARSER LA RÉPONSE
      try {
        const data = await response.json();
        console.log('✅ Code renvoyé avec succès:', data);
        return { message: data.message || 'Code renvoyé avec succès' };
      } catch {
        return { message: 'Code renvoyé avec succès' };
      }

    } catch (error) {
      console.error('❌ Erreur renvoi code:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Forgot password pour:', email);
      await this.mockDelay(1500);
      return { message: 'Email de réinitialisation envoyé' };
    }

    try {
      console.log('📤 Envoi vers:', `${API_BASE_URL}/auth/request-password-reset/`);
      
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
          
          if (response.status === 404) {
            // Ne pas révéler si l'email existe ou non pour la sécurité
            return { message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation.' };
          }
          
          throw new Error(errorData.error || 'Erreur lors de la demande');
        } else {
          // Réponse non-JSON
          const textResponse = await response.text();
          console.error('❌ Réponse non-JSON:', textResponse);
          throw new Error(`Erreur serveur ${response.status}`);
        }
      }

      // ✅ VÉRIFIER LE CONTENT-TYPE POUR LA RÉPONSE DE SUCCÈS
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ Réponse reçue:', data);
        return { message: data.message || 'Lien de réinitialisation envoyé' };
      } else {
        // Si pas de JSON, on assume que c'est un succès
        return { message: 'Lien de réinitialisation envoyé' };
      }

    } catch (error) {
      console.error('❌ Erreur mot de passe oublié:', error);
      throw error;
    }
  }

  async resetPassword(token, password, email) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Reset password');
      await this.mockDelay(1500);
      
      if (token === 'invalid-token') {
        throw new Error('Token invalide ou expiré');
      }
      
      return { message: 'Mot de passe réinitialisé avec succès' };
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cdabackend-production-3c8a.up.railway.app';
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          new_password: password, // ✅ UTILISER 'new_password' COMME ATTENDU PAR VOTRE BACKEND
          email: email // ✅ AJOUTER L'EMAIL COMME ATTENDU PAR VOTRE BACKEND
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        // ✅ GESTION SPÉCIFIQUE POUR VOTRE BACKEND
        let errorMessage;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Erreur lors de la réinitialisation';
        } catch {
          // Si la réponse n'est pas du JSON valide
          errorMessage = `Erreur serveur ${response.status}`;
        }
        
        if (response.status === 400) {
          throw new Error('Lien invalide ou expiré');
        }
        
        throw new Error(errorMessage);
      }

      // ✅ GESTION FLEXIBLE DE LA RÉPONSE
      let data = {};
      try {
        data = await response.json();
      } catch {
        // Si pas de JSON, on assume que c'est un succès
        data = { message: 'Mot de passe réinitialisé avec succès' };
      }
      
      return { message: data.message || 'Mot de passe réinitialisé avec succès' };
      
    } catch (error) {
      console.error('❌ Erreur reset password:', error);
      throw error;
    }
  }

  async validateResetToken(token, email = null) {
    if (MOCK_MODE) {
      console.log('🧪 MODE TEST - Validate token');
      await this.mockDelay(500);
      
      if (token === 'invalid-token') {
        return { valid: false, error: 'Token invalide' };
      }
      
      return { valid: true };
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cdabackend-production-3c8a.up.railway.app';
      
      // ✅ CONSTRUIRE L'URL AVEC LES PARAMÈTRES QUE VOTRE BACKEND ATTEND
      let url = `${API_BASE_URL}/auth/validate-reset-token/?token=${token}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Validate token status:', response.status);

      // ✅ GESTION FLEXIBLE MÊME SI L'ENDPOINT N'EXISTE PAS
      if (response.status === 404) {
        console.warn('⚠️ Endpoint validate-reset-token non trouvé, on assume que le token est valide');
        return { valid: true };
      }

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // Si pas de JSON, retourner invalid
          return { valid: false, error: 'Token invalide' };
        }
        
        return { 
          valid: false, 
          error: errorData.error || 'Token invalide',
          expired: errorData.expired || false
        };
      }

      // ✅ PARSER LA RÉPONSE DE SUCCÈS
      try {
        const data = await response.json();
        return { 
          valid: data.valid !== undefined ? data.valid : true,
          email: data.email,
          expires_in: data.expires_in
        };
      } catch {
        // Si pas de JSON mais status OK, on assume que c'est valide
        return { valid: true };
      }

    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      // En cas d'erreur de réseau, on assume que le token est valide pour ne pas bloquer l'utilisateur
      return { valid: true };
    }
  }

} // ✅ FERMER LA CLASSE

export const authService = new AuthService();
export { MOCK_MODE };