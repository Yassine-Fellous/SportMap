import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialisation du client TanStack Query
const queryClient = new QueryClient();

// Empêcher l'auto-masquage natif dès le premier cycle d'exécution
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, accessToken, updateUser, logout } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // --- HYDRATATION DU PROFIL ---
        if (accessToken) {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/auth/me/`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            updateUser(userData); // On injecte les données fraîches dans Zustand
          } else if (response.status === 401) {
            // Si le token est expiré ou invalide, on déconnecte
            logout();
          }
        }
      } catch (e) {
        console.warn("Erreur lors de l'hydratation initiale:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, [accessToken]); // Se relance si le token change

  useEffect(() => {
    if (appIsReady) {
      const inAuthGroup = segments[0] === '(tabs)';

      if (!isAuthenticated && inAuthGroup) {
        // Mur d'auth : Redirection vers Login
        router.replace('/login');
      } else if (isAuthenticated && (!segments[0] || segments[0] === 'login')) {
        // Redirection vers l'app si déjà connecté
        router.replace('/(tabs)/map');
      }

      SplashScreen.hideAsync();
    }
  }, [isAuthenticated, segments, appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
