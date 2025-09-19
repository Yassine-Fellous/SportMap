# 🚀 Environnement de Développement SportMap

Ce dossier contient tout le nécessaire pour lancer rapidement l'environnement de développement SportMap avec Docker.

## 📋 Prérequis

- **Docker Desktop** installé et en cours d'exécution
- **Docker Compose** (inclus avec Docker Desktop)
- **Git** pour cloner le projet

## ⚡ Démarrage Rapide

### 1. Configuration
```bash
# Se placer dans le dossier dev-env
cd dev-env

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env et configurer au minimum :
# VITE_MAPBOX_TOKEN=votre-token-mapbox
```

### 2. Lancement
```bash
# Démarrer l'environnement complet
./dev-start.sh

# Ou simplement
./dev-start.sh start
```

### 3. Accès aux services
Une fois démarré, les services sont disponibles sur :

- **🌐 Frontend (React)** : http://localhost:3000
- **🔌 Backend (Django API)** : http://localhost:8000
- **🗄️ Adminer (Gestion DB)** : http://localhost:8080
- **📊 Base de données** : localhost:5433

## 🛠️ Commandes Disponibles

Le script `dev-start.sh` offre plusieurs commandes :

```bash
./dev-start.sh start      # Démarrer l'environnement (défaut)
./dev-start.sh stop       # Arrêter tous les services
./dev-start.sh restart    # Redémarrer l'environnement
./dev-start.sh rebuild    # Reconstruire toutes les images
./dev-start.sh clean      # Nettoyer complètement (volumes + images)
./dev-start.sh logs       # Afficher les logs en temps réel
./dev-start.sh status     # Afficher le statut des services
```

### Scripts dédiés
```bash
./dev-logs.sh    # Afficher les logs en temps réel
./dev-stop.sh    # Arrêter l'environnement
```

## 📁 Structure

```
dev-env/
├── docker-compose.dev.yml    # Configuration Docker Compose
├── .env.example              # Variables d'environnement d'exemple
├── dev-start.sh              # Script principal de gestion
├── dev-logs.sh               # Affichage des logs
├── dev-stop.sh               # Arrêt des services
└── README.md                 # Cette documentation
```

## 🐳 Services Docker

### Backend (Django)
- **Port** : 8000
- **Utilise** : `Backend/Dockerfile` existant
- **Hot Reload** : Volume monté sur le code source
- **Base de données** : PostgreSQL automatique

### Frontend (React)
- **Port** : 3000
- **Utilise** : `Frontend/Dockerfile` existant (stage builder)
- **Hot Reload** : Volume monté + `npm run dev`
- **Variables** : Configurées via .env

### Base de données
- **Type** : PostgreSQL 15
- **Port** : 5433 (externe)
- **Utilisateur** : sportadmin
- **Base** : sport

### Adminer
- **Port** : 8080
- **Interface** : Gestion graphique de la base de données

## ⚙️ Configuration

### Variables d'environnement importantes

```bash
# OBLIGATOIRE - Token Mapbox pour afficher la carte
VITE_MAPBOX_TOKEN=pk.eyJ1...

# Base de données
DB_PASSWORD=postgres123

# Django
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True

# API URL
VITE_API_URL=http://localhost:8000
```

### Obtenir un token Mapbox
1. Créer un compte sur [Mapbox](https://account.mapbox.com/)
2. Aller dans [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copier le token par défaut ou en créer un nouveau
4. L'ajouter dans `.env` : `VITE_MAPBOX_TOKEN=votre-token`

## 🔧 Développement

### Hot Reload
- **Frontend** : Rechargement automatique des modifications
- **Backend** : Rechargement automatique avec le serveur Django

### Volumes Docker
- Code source monté en volumes pour modification en temps réel
- `node_modules` et environnements virtuels exclus

### Accès aux conteneurs
```bash
# Accéder au conteneur backend
docker exec -it sportmap_backend_dev bash

# Accéder au conteneur frontend
docker exec -it sportmap_frontend_dev sh

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend
```

## 🐛 Dépannage

### La carte ne s'affiche pas
- Vérifiez que `VITE_MAPBOX_TOKEN` est configuré dans `.env`
- Vérifiez que le token est valide sur Mapbox

### Erreur de base de données
```bash
# Reconstruire complètement
./dev-start.sh clean
./dev-start.sh rebuild
```

### Port déjà utilisé
```bash
# Vérifier les ports utilisés
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5433  # Database

# Modifier les ports dans docker-compose.dev.yml si nécessaire
```

### Problème de permissions
```bash
# Reconstruire les images
./dev-start.sh rebuild
```

## 📊 Monitoring

### Logs en temps réel
```bash
./dev-logs.sh
```

### Statut des services
```bash
./dev-start.sh status
```

### Health checks
Les services incluent des vérifications de santé automatiques.

## 🔄 Mise à jour

Après avoir mis à jour le code :

```bash
# Redémarrage simple
./dev-start.sh restart

# Reconstruction si nécessaire
./dev-start.sh rebuild
```

## 🚀 Production

Cet environnement est uniquement pour le développement. Pour la production :

- Utiliser les Dockerfiles originaux dans `Backend/` et `Frontend/`
- Configurer les variables d'environnement de production
- Utiliser un serveur web (Nginx) et une base de données externe

---

**Besoin d'aide ?** Consultez le [README principal](../README.md) ou ouvrez une issue GitHub.