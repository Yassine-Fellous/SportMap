#!/bin/bash

# 🚀 Script de démarrage de l'environnement de développement SportMap
# Ce script lance l'ensemble de la stack avec Docker Compose

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
print_message() {
    echo -e "${BLUE}[SportMap Dev]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SportMap Dev]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[SportMap Dev]${NC} $1"
}

print_error() {
    echo -e "${RED}[SportMap Dev]${NC} $1"
}

# Vérifier que Docker est installé et en cours d'exécution
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez installer Docker Desktop."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose n'est pas installé."
        exit 1
    fi
}

# Créer le fichier .env s'il n'existe pas
create_env_file() {
    if [ ! -f .env ]; then
        print_message "Création du fichier .env..."
        cp .env.example .env
        print_warning "⚠️  Veuillez configurer les variables d'environnement dans le fichier .env"
        print_warning "   Notamment VITE_MAPBOX_TOKEN pour afficher la carte"
    fi
}

# Fonction principale de démarrage
start_dev_environment() {
    print_message "🚀 Démarrage de l'environnement de développement SportMap..."
    
    # Vérifications préalables
    check_docker
    create_env_file
    
    # Construire et démarrer les services
    print_message "📦 Construction des images Docker..."
    docker-compose -f docker-compose.dev.yml build
    
    print_message "🔄 Démarrage des services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_message "⏳ Attente du démarrage des services..."
    sleep 10
    
    # Vérifier le statut des services
    print_message "📊 Vérification du statut des services..."
    docker-compose -f docker-compose.dev.yml ps
    
    print_success "✅ Environnement de développement démarré avec succès!"
    echo ""
    print_message "🌐 Services disponibles:"
    echo "   • Frontend (React):     http://localhost:3000"
    echo "   • Backend (Django API): http://localhost:8000"
    echo "   • Adminer (DB Admin):   http://localhost:8080"
    echo "   • Base de données:      localhost:5433"
    echo ""
    print_message "📝 Pour voir les logs: ./dev-logs.sh"
    print_message "🛑 Pour arrêter:       ./dev-stop.sh"
    echo ""
    print_warning "⚠️  Si la carte ne s'affiche pas, vérifiez votre VITE_MAPBOX_TOKEN dans .env"
}

# Gestion des arguments
case "${1:-start}" in
    "start")
        start_dev_environment
        ;;
    "logs")
        print_message "📝 Affichage des logs..."
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    "stop")
        print_message "🛑 Arrêt de l'environnement de développement..."
        docker-compose -f docker-compose.dev.yml down
        print_success "✅ Environnement arrêté"
        ;;
    "restart")
        print_message "🔄 Redémarrage de l'environnement..."
        docker-compose -f docker-compose.dev.yml down
        sleep 2
        start_dev_environment
        ;;
    "rebuild")
        print_message "🔨 Reconstruction complète..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml build --no-cache
        start_dev_environment
        ;;
    "clean")
        print_message "🧹 Nettoyage complet..."
        docker-compose -f docker-compose.dev.yml down -v --rmi all
        docker system prune -f
        print_success "✅ Nettoyage terminé"
        ;;
    "status")
        print_message "📊 Statut des services:"
        docker-compose -f docker-compose.dev.yml ps
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|rebuild|clean|logs|status}"
        echo ""
        echo "Commandes disponibles:"
        echo "  start    - Démarrer l'environnement de développement (défaut)"
        echo "  stop     - Arrêter tous les services"
        echo "  restart  - Redémarrer l'environnement"
        echo "  rebuild  - Reconstruire toutes les images"
        echo "  clean    - Nettoyer complètement (supprime volumes et images)"
        echo "  logs     - Afficher les logs en temps réel"
        echo "  status   - Afficher le statut des services"
        exit 1
        ;;
esac