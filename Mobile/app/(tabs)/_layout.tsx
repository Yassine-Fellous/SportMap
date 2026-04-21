import { Tabs } from 'expo-router';

// Layout des onglets (Tabs), restreint aux utilisateurs authentifiés grâce au Auth Wall racine
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: { display: 'none' } // Masque complètement la barre de navigation inférieure
    }}>
      {/* Configuration basique de l'onglet Carte */}
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Carte Sportive',
          tabBarLabel: 'Carte',
        }} 
      />
    </Tabs>
  );
}
