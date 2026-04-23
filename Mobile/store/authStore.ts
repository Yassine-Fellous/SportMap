import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface pour les données utilisateur (alignée sur le Serializer Django)
interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'SUPER_ADMIN' | 'MUNICIPAL_AGENT' | 'CLUB_MANAGER' | 'ADVERTISER' | 'USER';
  age: number | null;
  sports_interests: string[];
  organization_id: number | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setToken: (token: string) => void; // Alias pour compatibilité
  updateUser: (user: User) => void;
  logout: () => void;
}

// Store Zustand persistant
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // Définit les tokens et l'utilisateur (après login)
      setAuth: (token: string, refreshToken: string, user: User) =>
        set({
          accessToken: token,
          refreshToken: refreshToken,
          user: user,
          isAuthenticated: true,
        }),

      // Alias pour ne pas casser le login existant (mais devrait être migré vers setAuth)
      setToken: (token: string) =>
        set({
          accessToken: token,
          isAuthenticated: true,
        }),

      // Mise à jour du profil (hydratation)
      updateUser: (user: User) =>
        set({
          user: user,
        }),

      // Déconnexion complète
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // Clé dans AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
