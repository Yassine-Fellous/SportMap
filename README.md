# 🏃‍♂️ SportMap - Cartographie Interactive des Infrastructures Sportives

[![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=flat&logo=django&logoColor=white)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-000000?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Performance](https://img.shields.io/badge/Performance-+340%25-00D084?style=flat)](./Backend/RAPPORT_MIGRATION.md)

Une cartographie complète des infrastructures sportives en France accessible sur Web (PWA) et Mobile (iOS/Android), permettant à la communauté de rechercher et signaler l'état des équipements de manière collaborative.

## 📋 Vue d'ensemble

### 🎯 Vision du Projet
SportMap démocratise l'accès au sport en France en créant la première plateforme collaborative de cartographie des équipements sportifs. Notre mission est de connecter les sportifs aux infrastructures disponibles tout en permettant à la communauté de maintenir et d'améliorer ces données en temps réel.

### ✨ Fonctionnalités principales
- **🗺️ Cartographie web et mobile** : 5,825+ installations sportives (API Mapbox GL JS / Mapbox Maps RN)
- **📍 Géolocalisation native** : Détection en direct et suivi de l'utilisateur pour trouver les équipements à proximité
- **🎯 Clustering GPU-Accelerated** : Navigation fluide avec calculs natifs des regroupements de points
- **🚨 Signalements communautaires** : Système de rapports d'incidents/maintenance
- **👨‍💼 Administration** : Interface de gestion pour les modérateurs
- **🔐 Authentification complète** : JWT, validation email, reset password
- **⚡ Performances optimisées** : Cache intelligent, 98% d'amélioration des temps de réponse
- **📱 Interface responsive** : Adaptée mobile/desktop avec géolocalisation
- **🔍 Recherche et filtres** : Par sport, localisation parmi 168 sports différents, libre accées, PMR ♿

## 🏗️ Architecture Technique

```
SportMap/
├── 📁 Backend/               # API Django REST
│   ├── 📁 authentication/    # JWT Auth, Users
│   ├── 📁 installations/     # Données GeoJSON, clustering API 
│   ├── 📁 signalements/      # Incident reports
│   └── 📄 manage.py          # Entrypoint
│
├── 📁 Frontend/              # PWA Web
│   ├── 📁 src/               # Code React + Vite
│   └── 📄 package.json       # Dépendances Web
│
├── 📁 Mobile/                # App Mobile Native
│   ├── 📁 app/               # Expo Router (Tabs, Stacks)
│   ├── 📁 components/        # UI BottomSheets, Sliders
│   └── 📄 package.json       # Dépendances Mobile
│
└── 📁 dev-env/               # Outils DevOps & Docker Compose
```

### Stack Technologique

#### 🌐 Web (Frontend)
- **Framework** : React 18.3.1 + Vite (PWA)
- **Styling** : TailwindCSS + CSS Modules
- **Cartographie** : Mapbox GL JS + react-map-gl
- **Routing** : React Router DOM

#### 📱 Mobile (iOS / Android)
- **Framework** : React Native 0.74 / Expo SDK 51
- **Cartographie native** : `@rnmapbox/maps` v10.1.33
- **Animations / Gestures** : Reanimated 3, Gesture Handler, `@gorhom/bottom-sheet`
- **Architecture** : Expo Router, Zustand (State), React Query (Data Fetching)
- **Modules natifs** : `expo-location`

#### ⚙️ Serveur & BDD (Backend)
- **Framework** : Django 4.2.7 + DRF
- **Base de données** : PostgreSQL 15 + PostGIS (GeoDjango readiness)
- **Authentification** : JWT (PyJWT)
- **Déploiement** : Gunicorn + WhiteNoise + Railway / Docker Compose

## 🚀 Installation et Développement

### Prérequis
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (Recommandé pour config locale)
- Xcode (pour build iOS) / Android Studio (Android)

### 🐳 Démarrage Rapide (Web & API via Docker)
```bash
# Lancer les conteneurs PostgreSQL, Backend API et Frontend Vite
cd dev-env
./dev-start.sh

# Web UI => http://localhost:5173
# API => http://localhost:8000
```

### 📱 Démarrage Mobile (Expo)
L'application mobile requiert une clé Mapbox et est compilée nativement (Prebuild).
```bash
cd Mobile

# 1. Configurer la variable Mapbox
# Modifier ou créer un .env (EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx)

# 2. Installer les packages
npm install

# 3. Lancer l'application via Expo Dev Client (iOS en exemple)
npx expo run:ios --device "iPhone"
# ou pour simulateur :
# npx expo run:ios
```

## 🌐 APIs Backend

### Authentification
- `POST /auth/register/` - Inscription
- `POST /auth/login/` - Connexion
- `POST /auth/logout/` - Déconnexion
- `POST /auth/password-reset/` - Reset mot de passe
- `POST /auth/verify-email/` - Vérification email

### Installations Sportives
- `GET /installations/` - Liste des équipements (avec cache)
- `GET /installations/{id}/` - Détail d'un équipement
- `GET /installations/sports/` - Liste des sports
- `GET /installations/search/` - Recherche géographique

### Signalements
- `GET /signalements/` - Liste des signalements
- `POST /signalements/` - Créer un signalement
- `PUT /signalements/{id}/` - Modifier un signalement (admin)

## 📊 Données

### Dataset
- **5,230 équipements sportifs** dans les Bouches-du-Rhône (suite à un nettoyage des données scolaires ou sensibles)
- **168 types de sports** référencés
- **Géolocalisation précise** de chaque installation
- **Données nettoyées et filtrées** depuis les sources officielles

### 🌍 Base de Données & Import
Le dataset actuel s'importe facilement dans le conteneur backend ou un env virtuel :
```bash
# Dans le conteneur backend ou env virtuel :
python manage.py makemigrations
python manage.py migrate
python manage.py load_csv data/cleaned-data-es.csv --clear
```

## 🤝 Contribution
1. Cloner le projet et créer une branche (ex: `feature/MapboxFilters`).
2. Vérifier l'audit des **`.gitignore`** (ne jamais push `Mobile/ios`, `Mobile/android`, `node_modules`, `venv`, ou clés API).
3. Soumettre une Pull Request pour validation par les pairs.

## 📝 License
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
**Fait avec ❤️ pour démocratiser l'accès au sport en France**
