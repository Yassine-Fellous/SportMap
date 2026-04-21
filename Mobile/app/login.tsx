import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Écran de connexion public
export default function LoginScreen() {
  const { setToken } = useAuthStore();

  const handleMockLogin = () => {
    // Simulation d'une connexion réussie via l'API Django
    // SetToken déclenche automatiquement la redirection vers /(tabs) définie dans _layout.tsx
    setToken('mock-jwt-access-token');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur SportMap</Text>
      <Text style={styles.subtitle}>Connectez-vous pour voir la carte</Text>
      <Button title="Se connecter (Mock)" onPress={handleMockLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
});
