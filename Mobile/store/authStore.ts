import { create } from 'zustand';

// Store Zustand qui gère l'état global d'authentification pour toute l'application
// L'état est persistant en mémoire mais synchronisable avec les requêtes TanStack
interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false, // État dérivé directement mis à jour avec le token
  
  setToken: (token: string) => 
    set({ 
      accessToken: token, 
      isAuthenticated: true 
    }),
    
  logout: () => 
    set({ 
      accessToken: null, 
      isAuthenticated: false 
    }),
}));
