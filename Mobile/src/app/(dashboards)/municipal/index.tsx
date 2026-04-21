import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Optionnel: installez react-native-chart-kit
// import { ProgressChart } from 'react-native-chart-kit';

export default function MunicipalDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Remplacer l'URL par l'appel `api.get('/analytics/municipal-dashboard/')` de l'API
    setData({
      metrics: {
        health_score_pct: 98.4,
        active_alerts: 12,
        avg_resolution_days: 2
      },
      heatmap: []
    });
  }, []);

  if (!data) return <Text>Chargement des statistiques...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Tableau de Bord Municipal</Text>

      {/* Carte KPI : Score de santé */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Santé du Parc Sportif</Text>
        <Text style={styles.metricText}>{data.metrics.health_score_pct}% Opérationnel</Text>
      </View>

      {/* KPI : Alertes & Délais */}
      <View style={[styles.card, {flexDirection: 'row', justifyContent: 'space-between'}]}>
        <View>
          <Text style={styles.kpiValue}>{data.metrics.active_alerts}</Text>
          <Text style={styles.kpiLabel}>Dégradations en cours</Text>
        </View>
        <View>
          <Text style={styles.kpiValue}>{data.metrics.avg_resolution_days} jours</Text>
          <Text style={styles.kpiLabel}>MTTR (Délai moyen)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8', padding: 15, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#7F8C8D', marginBottom: 10 },
  metricText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#2ECC71' },
  kpiValue: { fontSize: 28, fontWeight: 'bold', color: '#E74C3C' },
  kpiLabel: { fontSize: 12, color: '#95A5A6' }
});