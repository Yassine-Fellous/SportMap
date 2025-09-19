#!/bin/bash

# 🛑 Script pour arrêter l'environnement de développement SportMap

# Couleurs pour les messages
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}[SportMap Dev]${NC} 🛑 Arrêt de l'environnement de développement..."

# Se déplacer dans le répertoire du script
cd "$(dirname "$0")"

# Arrêter tous les services
docker-compose -f docker-compose.dev.yml down

echo -e "${GREEN}[SportMap Dev]${NC} ✅ Environnement arrêté avec succès!"