import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

// Création de l'instance Axios centralisée
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTEUR DE REQUÊTE ---
// Ajoute automatiquement le token JWT à chaque appel
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTEUR DE RÉPONSE ---
// Gère le rafraîchissement automatique si le token expire (Erreur 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          console.log("🔄 Tentative de rafraîchissement du token...");
          
          // Appel à l'endpoint de refresh du backend
          const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token/`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;

          // Mise à jour de Zustand avec le nouveau token
          // On garde l'utilisateur actuel, on change juste le token
          const currentUser = useAuthStore.getState().user;
          const currentRefresh = useAuthStore.getState().refreshToken;
          
          if (currentUser && currentRefresh) {
            useAuthStore.getState().setAuth(access_token, currentRefresh, currentUser);
          }

          // On met à jour le header de la requête originale et on réessaie
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Si le refresh token est aussi expiré, on déconnecte l'utilisateur
          console.error("❌ Échec du refresh token, déconnexion...");
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
