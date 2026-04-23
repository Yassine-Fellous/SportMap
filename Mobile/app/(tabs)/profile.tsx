import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { logout } = useAuthStore();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>
      <Button title="Se déconnecter" color="#ef4444" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 }
});
