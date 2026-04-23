import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Erreur", "Le code doit contenir 6 chiffres");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/verify-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Votre compte a été validé !", [
          { text: "Se connecter", onPress: () => router.replace('/login') }
        ]);
      } else {
        Alert.alert("Erreur", result.error || "Code invalide");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/auth/resend-verification-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Code envoyé", "Un nouveau code de vérification a été envoyé à votre adresse email.");
      } else {
        Alert.alert("Erreur", result.error || result.message || "Impossible de renvoyer le code");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification</Text>
      <Text style={styles.subtitle}>Entrez le code envoyé à {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleVerify}
        disabled={loading || resending}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Vérifier</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.resendButton]} 
        onPress={handleResendCode}
        disabled={loading || resending}
      >
        {resending ? <ActivityIndicator color="#007AFF" /> : <Text style={[styles.buttonText, styles.resendButtonText]}>Renvoyer le code</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  resendButton: {
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendButtonText: { color: '#007AFF' },
  linkText: { color: '#007AFF', textAlign: 'center', fontSize: 14, marginTop: 10 },
});
