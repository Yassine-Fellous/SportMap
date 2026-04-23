import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Layout des onglets (Tabs), restreint aux utilisateurs authentifiés grâce au Auth Wall racine
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: { display: 'flex', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e5e5' },
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#64748b',
    }}>
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Carte',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="municipal" 
        options={{ 
          title: 'Municipal',
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="report" 
        options={{ 
          title: 'Signaler',
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}
