// ✅ CONFIGURATION CLOUDINARY AVEC FALLBACK ROBUSTE
const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dzpsl9lfc',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '414829747788521',
  upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sportmap-reports-unsigned',
};

class CloudinaryService {
  constructor() {
    this.baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}`;
    
    // ✅ VALIDATION AMÉLIORÉE
    this.validateConfig();
  }

  // ✅ VALIDATION AMÉLIORÉE AVEC DEBUG
  validateConfig() {
    console.log('🔍 Validation configuration Cloudinary...');
    console.log('📋 Variables d\'environnement détectées:');
    console.log('  - VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('  - VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    console.log('  - VITE_CLOUDINARY_API_KEY:', import.meta.env.VITE_CLOUDINARY_API_KEY ? '***masqué***' : 'MANQUANT');
    
    console.log('📋 Configuration finale:');
    console.log('  - Cloud name:', CLOUDINARY_CONFIG.cloud_name);
    console.log('  - Upload preset:', CLOUDINARY_CONFIG.upload_preset);
    console.log('  - API key:', CLOUDINARY_CONFIG.api_key ? `${CLOUDINARY_CONFIG.api_key.slice(0, 6)}...` : 'MANQUANT');
    
    const requiredFields = ['cloud_name', 'upload_preset'];
    const missing = requiredFields.filter(field => !CLOUDINARY_CONFIG[field]);
    
    if (missing.length > 0) {
      console.error('❌ Configuration Cloudinary manquante:', missing);
      throw new Error(`Configuration Cloudinary manquante: ${missing.join(', ')}`);
    }
    
    console.log('✅ Configuration Cloudinary validée');
    console.log('🌐 URL base:', this.baseUrl);
  }

  // ✅ UPLOAD AVEC PLUS DE DEBUG
  async uploadImage(file) {
    try {
      console.log('📤 === DÉBUT UPLOAD CLOUDINARY ===');
      console.log('📋 Fichier reçu:', {
        name: file.file?.name,
        size: file.file?.size,
        type: file.file?.type
      });

      // ✅ VALIDATION DU FICHIER
      if (!file || !file.file) {
        throw new Error('Fichier invalide - structure attendue: { file: File }');
      }

      // ✅ VALIDATION TAILLE ET TYPE
      if (file.file.size > 5 * 1024 * 1024) {
        throw new Error(`Fichier trop volumineux: ${(file.file.size / 1024 / 1024).toFixed(1)}MB (max 5MB)`);
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.file.type)) {
        throw new Error(`Type de fichier non supporté: ${file.file.type}`);
      }

      console.log('✅ Validation fichier OK');

      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
      formData.append('folder', 'sportmap/reports');
      
      console.log('📋 FormData préparé:');
      console.log('  - Upload preset:', CLOUDINARY_CONFIG.upload_preset);
      console.log('  - Folder:', 'sportmap/reports');
      console.log('  - URL endpoint:', `${this.baseUrl}/image/upload`);

      const response = await fetch(`${this.baseUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Réponse HTTP:', response.status, response.statusText);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Erreur HTTP Cloudinary:', response.status);
        console.error('❌ Réponse complète:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
        } catch (parseError) {
          throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Upload réussi:', data.secure_url);
      console.log('📤 === FIN UPLOAD CLOUDINARY ===');

      return {
        url: data.secure_url,
        public_id: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes,
        created_at: data.created_at,
      };

    } catch (error) {
      console.error('❌ === ERREUR UPLOAD CLOUDINARY ===');
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      throw new Error(`Erreur upload: ${error.message}`);
    }
  }

  // ✅ UPLOAD MULTIPLE IMAGES
  async uploadMultipleImages(images) {
    try {
      console.log(`📤 Upload de ${images.length} images...`);

      if (images.length === 0) {
        return [];
      }

      // ✅ LIMITATION DU NOMBRE D'IMAGES
      if (images.length > 3) {
        throw new Error('Maximum 3 images autorisées par signalement');
      }

      // ✅ UPLOAD EN PARALLÈLE AVEC DÉLAI ÉCHELONNÉ
      const uploadPromises = images.map(async (image, index) => {
        try {
          // Délai échelonné pour éviter la surcharge de l'API (300ms entre chaque)
          await new Promise(resolve => setTimeout(resolve, index * 300));
          
          console.log(`📤 Upload image ${index + 1}/${images.length}...`);
          const result = await this.uploadImage(image);
          console.log(`✅ Image ${index + 1} uploadée:`, result.url);
          
          return result;
        } catch (error) {
          console.error(`❌ Erreur upload image ${index + 1}:`, error);
          throw new Error(`Erreur image ${index + 1}: ${error.message}`);
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // ✅ TRAITER LES RÉSULTATS
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason.message);

      if (failed.length > 0) {
        console.warn('⚠️ Certaines images ont échoué:', failed);
        
        // Si toutes ont échoué, lever une erreur
        if (successful.length === 0) {
          throw new Error('Aucune image n\'a pu être uploadée: ' + failed.join(', '));
        }
        
        // Si certaines ont échoué, on continue avec celles qui ont réussi
        console.warn(`⚠️ ${successful.length}/${images.length} images uploadées avec succès`);
      }
      
      console.log(`✅ ${successful.length}/${images.length} images uploadées avec succès`);
      
      return successful;

    } catch (error) {
      console.error('❌ Erreur upload multiple:', error);
      throw error;
    }
  }

  // ✅ EXTRAIRE LES URLs POUR LE BACKEND
  extractUrls(uploadResults) {
    if (!Array.isArray(uploadResults) || uploadResults.length === 0) {
      return null;
    }
    
    const urls = uploadResults.map(result => result.url);
    return urls.join(','); // Format attendu par votre backend
  }

  // ✅ GÉNÉRER URL OPTIMISÉE DIRECTEMENT
  generateOptimizedUrl(publicId, transformations = {}) {
    if (!publicId) return null;
    
    // Convertir les transformations en string Cloudinary
    const transformString = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
    
    const baseTransform = 'f_auto,q_auto'; // Format et qualité automatiques
    const fullTransform = transformString ? `${baseTransform},${transformString}` : baseTransform;
    
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/${fullTransform}/${publicId}`;
  }

  // ✅ URLS PRÉDÉFINIES POUR DIFFÉRENTS USAGES
  getThumbnailUrl(publicId) {
    return this.generateOptimizedUrl(publicId, { 
      w: 200, h: 150, c: 'fill', q: 'auto:low' 
    });
  }

  getMediumUrl(publicId) {
    return this.generateOptimizedUrl(publicId, { 
      w: 600, h: 400, c: 'fill', q: 'auto:good' 
    });
  }

  getLargeUrl(publicId) {
    return this.generateOptimizedUrl(publicId, { 
      w: 1200, h: 900, c: 'limit', q: 'auto:best' 
    });
  }

  // ✅ EXTRAIRE PUBLIC_ID DEPUIS UNE URL CLOUDINARY
  extractPublicIdFromUrl(url) {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.[a-z]+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      console.error('❌ Erreur extraction public_id:', error);
      return null;
    }
  }

  // ✅ SUPPRIMER UNE IMAGE (nécessite signature côté serveur)
  async deleteImage(publicId) {
    try {
      console.log(`🗑️ Demande suppression image: ${publicId}`);
      
      // ✅ POUR L'INSTANT, SIMULATION CAR LA SUPPRESSION NÉCESSITE UNE SIGNATURE
      // TODO: Implémenter via backend avec authentification admin
      console.warn('⚠️ Suppression d\'images nécessite une implémentation backend avec signature');
      
      return { 
        success: true, 
        message: 'Suppression simulée (nécessite implémentation backend avec signature)' 
      };
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      throw error;
    }
  }

  // ✅ VÉRIFIER LE STATUT DE CLOUDINARY
  async checkStatus() {
    try {
      const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/sample.jpg`, {
        method: 'HEAD' // Juste vérifier l'accessibilité
      });
      
      const isOnline = response.ok;
      console.log(`🌐 Cloudinary status: ${isOnline ? '✅ En ligne' : '❌ Hors ligne'}`);
      
      return isOnline;
    } catch (error) {
      console.error('❌ Cloudinary indisponible:', error);
      return false;
    }
  }

  // ✅ DEBUG INFO
  getDebugInfo() {
    return {
      cloud_name: CLOUDINARY_CONFIG.cloud_name,
      upload_preset: CLOUDINARY_CONFIG.upload_preset,
      base_url: this.baseUrl,
      config_valid: !!CLOUDINARY_CONFIG.cloud_name && !!CLOUDINARY_CONFIG.upload_preset,
      api_endpoint: `${this.baseUrl}/image/upload`
    };
  }

  // ✅ MÉTHODE DE TEST
  async testConnection() {
    try {
      console.log('🧪 Test de connexion Cloudinary...');
      console.log('📋 Configuration:', this.getDebugInfo());
      
      const isOnline = await this.checkStatus();
      
      if (!isOnline) {
        throw new Error('Cloudinary indisponible');
      }
      
      console.log('✅ Test de connexion réussi');
      return true;
      
    } catch (error) {
      console.error('❌ Test de connexion échoué:', error);
      throw error;
    }
  }
}

export default new CloudinaryService();