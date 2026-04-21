import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

// Simulation du store d'authentification (à relier avec votre vrai Zustand ou Context)
export const useAuthStore = () => {
    return {
        user: { role: 'MUNICIPAL_AGENT' }, // Valeur temporaire
        isLoading: false
    };
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    // Logique de Split Routing basée sur le RBAC
    if (!user && !inAuthGroup) {
      // router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      switch (user.role) {
        case 'SUPER_ADMIN':
          router.replace('/(dashboards)/admin-hub');
          break;
        case 'MUNICIPAL_AGENT':
          router.replace('/(dashboards)/municipal');
          break;
        case 'CLUB_MANAGER':
          router.replace('/(dashboards)/club');
          break;
        default:
          router.replace('/(app)/map');
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#2ECC71" /></View>;
  }

  return <>{children}</>;
}
