import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialisation du client TanStack Query
const queryClient = new QueryClient();

// Empêcher l'auto-masquage natif dès le premier cycle d'exécution (en dehors du cycle React)
SplashScreen.preventAutoHideAsync();

// Layout Racine (Root Layout) 
// Il fait office de "Auth Wall" et protège l'accès à l'arborescence /(tabs)
export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Pré-chargement des ressources (Fonts, appels API basiques, etc.)
        // await Font.loadAsync(Entypo.font);
        // await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation de chargement API
      } catch (e) {
        console.warn(e);
      } finally {
        // Quoi qu'il arrive (succès ou échec HTTP), on autorise le rendu de l'interface
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    // On attend que l'app soit prête ET que notre logique d'authenfication (les segments de router) soit évaluée
    if (appIsReady) {
      const inAuthGroup = segments[0] === '(tabs)';

      if (!isAuthenticated && inAuthGroup) {
        // Redirection automatique si non authentifié vers l'écran de login
        router.replace('/login');
      } else if (isAuthenticated && !inAuthGroup) {
        // Empêcher l'utilisateur connecté de revenir sur le login (ou écrans publics externes)
        router.replace('/(tabs)/map');
      }

      // Tout est calculé, l'interface racine est montée, on peut cacher le SplashScreen natif sans crasher
      SplashScreen.hideAsync();
    }
  }, [isAuthenticated, segments, appIsReady]);

  if (!appIsReady) {
    return null; // Affiche le native Splashscreen le temps que useEffect(prepareApp) finisse
  }

  // Slot s'occupe de rendre dynamiquement la route enfant correspondante selon Expo Router
  // GestureHandlerRootView englobe toute l'application pour activer les gestes (BottomSheet, Swipe)
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
