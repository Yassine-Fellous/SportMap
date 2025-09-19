#!/bin/bash
echo "🧹 Nettoyage final de l'architecture SportMap..."

# Supprimer les anciens scripts de nettoyage
echo "Suppression des anciens scripts..."
rm -f clean-up.sh
rm -f cleanup-architecture.sh  
rm -f migrate.sh
rm -f restore-backup.sh

# Supprimer les doublons potentiels
echo "Suppression des fichiers en doublon..."
rm -f src/components/HomePage.jsx
rm -f src/components/AboutPage.jsx  
rm -f src/components/SportsPage.jsx
rm -f src/components/AuthPage.jsx

# Supprimer les hooks dupliqués
rm -f src/hooks/useAuth.js

# Supprimer les versions de test/backup
rm -f src/components/Map/popup/MapPopup_TEST.jsx
rm -f src/components/Map/popup/MapPopup_fixed.jsx
rm -f src/components/Map/popup/MapPopup_backup.jsx

# Supprimer les dossiers vides
find src -type d -empty -delete

echo "✅ Nettoyage terminé !"
echo "📂 Structure clean prête pour la production"