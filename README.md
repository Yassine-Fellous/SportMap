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

## 🚀 Installation et Développement (macOS)

Suivez ces étapes pour configurer l'ensemble de l'écosystème SportMap sur votre Mac.

### 1. Prérequis
- **Homebrew** : `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- **Node.js & Python** : `brew install node python@3.11`
- **Docker** : [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Outils iOS** : Installer **Xcode** (via l'App Store) et **CocoaPods** (`brew install cocoapods`)

### 2. Cloner le Projet
```bash
git clone https://github.com/votre-compte/SportMap.git
cd SportMap
```

### 3. Backend & Base de données (Via Docker)
C'est la méthode recommandée pour avoir une base de données PostgreSQL/PostGIS fonctionnelle immédiatement.
```bash
cd dev-env
cp .env.example .env  # Configurez vos clés ici
./dev-start.sh
```
*L'API est maintenant disponible sur [http://localhost:8000](http://localhost:8000).*

#### Créer un compte Admin
```bash
# Entrer dans le conteneur backend
docker exec -it sportmap-backend python manage.py createsuperuser
```

### 4. Application Mobile (iOS)
L'application mobile utilise Expo avec des modules natifs (Mapbox).
```bash
cd ../Mobile

# 1. Installer les dépendances
npm install

# 2. Configurer Mapbox (Indispensable)
# Créez un fichier .env dans le dossier Mobile/
echo "EXPO_PUBLIC_MAPBOX_TOKEN=votre_cle_mapbox_pk_ici" > .env

# 3. Installer les dépendances natives (CocoaPods)
cd ios && pod install && cd ..

# 4. Lancer sur simulateur iOS
npx expo run:ios
```

### 5. Accès aux interfaces
- **📱 Mobile (Simulateur)** : S'ouvre automatiquement via le build Xcode.
- **🌐 Backend API** : [http://localhost:8000](http://localhost:8000)
- **🛠️ Admin Django** : [http://localhost:8000/admin](http://localhost:8000/admin)
- **💻 Web PWA (Legacy)** : [http://localhost:5173](http://localhost:5173)

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

