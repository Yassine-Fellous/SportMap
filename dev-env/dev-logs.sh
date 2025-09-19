#!/bin/bash

# 📝 Script pour afficher les logs de l'environnement de développement SportMap

# Couleurs pour les messages
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[SportMap Dev]${NC} 📝 Affichage des logs en temps réel..."
echo -e "${BLUE}[SportMap Dev]${NC} Appuyez sur Ctrl+C pour arrêter"
echo ""

# Se déplacer dans le répertoire du script
cd "$(dirname "$0")"

# Afficher les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f