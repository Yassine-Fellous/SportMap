# 🏃‍♂️ SportMap - Cartographie Interactive des Infrastructures Sportives

[![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=flat&logo=django&logoColor=white)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=flat&logo=railway&logoColor=white)](https://railway.app/)
[![Performance](https://img.shields.io/badge/Performance-+340%25-00D084?style=flat)](./Backend/RAPPORT_MIGRATION.md)

Une Progressive Web App (PWA) complète pour cartographier et évaluer toutes les infrastructures sportives en France de manière collaborative et interactive.

## 📋 Vue d'ensemble

### 🎯 Vision du Projet
SportMap démocratise l'accès au sport en France en créant la première plateforme collaborative de cartographie des équipements sportifs. Notre mission est de connecter les sportifs aux infrastructures disponibles tout en permettant à la communauté de maintenir et améliorer ces données en temps réel.

### ✨ Fonctionnalités principales
- **🗺️ Cartographie interactive** : 5,825+ installations sportives géolocalisées avec Mapbox GL JS
- **🚨 Signalements communautaires** : Système de rapports d'incidents/maintenance
- **👨‍💼 Administration** : Interface de gestion pour les modérateurs
- **🔐 Authentification complète** : JWT, validation email, reset password
- **⚡ Performances optimisées** : Cache intelligent, 98% d'amélioration des temps de réponse
- **📱 Interface responsive** : Adaptée mobile/desktop avec géolocalisation
- **🔍 Recherche et filtres** : Par sport, localisation parmi 168 sports différents, libre accées, PMR ♿

## 🏗️ Architecture Technique

```
SportMap/
├── 📁 Frontend/              # React + Vite + TailwindCSS
│   ├── 📁 src/
│   │   ├── 📁 components/    # Composants réutilisables
│   │   ├── 📁 pages/         # Pages de l'application
│   │   ├── 📁 services/      # APIs et services
│   │   ├── 📁 hooks/         # Hooks React personnalisés
│   │   └── 📁 utils/         # Utilitaires
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 Dockerfile
│
├── 📁 Backend/               # Django REST API
│   ├── 📁 authentication/   # Système d'authentification
│   ├── 📁 installations/    # Gestion équipements sportifs
│   ├── 📁 signalements/     # Système de signalements
│   ├── 📁 config/           # Configuration Django
│   ├── 📁 data/             # Dataset équipements (5,825)
│   ├── 📄 requirements.txt
│   ├── 📄 manage.py
│   └── 📄 Dockerfile
│
└── 📄 docker-compose.yaml   # Stack complète
```

### Stack Technologique

#### Frontend
- **Framework** : React 18.3.1 + Vite
- **Styling** : TailwindCSS + CSS Modules
- **Cartographie** : Mapbox GL JS + react-map-gl
- **Routing** : React Router DOM
- **Animation** : Framer Motion
- **Icons** : Lucide React + React Icons
- **Analytics** : Google Analytics 4

#### Backend
- **Framework** : Django 4.2.7 + Django REST Framework
- **Base de données** : PostgreSQL 15
- **Authentification** : JWT (PyJWT)
- **Email** : Intégration Brevo
- **Serveur** : Gunicorn + WhiteNoise
- **CORS** : django-cors-headers

## 🚀 Installation et Développement

### Prérequis
- Python 3.9+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optionnel)

### 🐳 Démarrage rapide avec Docker

```bash
# Cloner le projet
git clone <repository-url>
cd SportMap

# Démarrer l'ensemble de la stack
docker-compose up --build

# L'application sera disponible sur :
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### 🔧 Installation manuelle

#### Backend (Django)

```bash
cd Backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configuration de la base de données
# Créer une base PostgreSQL et configurer les variables d'environnement
export DATABASE_URL="postgresql://user:password@localhost:5432/sportmap"
export SECRET_KEY="your-secret-key"
export DEBUG="True"

# Migrations
python manage.py migrate

# Charger les données d'équipements sportifs
python manage.py load_csv

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur de développement
python manage.py runserver
```

#### Frontend (React)

```bash
cd Frontend

# Installer les dépendances
npm install

# Configuration
# Créer un fichier .env avec votre token Mapbox
echo "VITE_MAPBOX_TOKEN=your-mapbox-token" > .env

# Démarrer le serveur de développement
npm run dev
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
- **5,825 équipements sportifs** dans les Bouches-du-Rhône
- **168 types de sports** référencés
- **Géolocalisation précise** de chaque installation
- **Données nettoyées et filtrées** depuis les sources officielles

### Format GeoJSON
Les données sont servies au format GeoJSON optimisé pour l'affichage cartographique avec mise en cache intelligente.

## 📈 Performances

- **98% d'amélioration** des temps de réponse API
- **Cache intelligent** avec invalidation automatique
- **Optimisation des requêtes** PostgreSQL
- **Compression GeoJSON** pour transferts rapides

Voir le [rapport technique détaillé](./Backend/RAPPORT_MIGRATION.md) pour plus d'informations.

## 🔧 Configuration Production

### Variables d'environnement Backend
```bash
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://...
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
BREVO_API_KEY=your-brevo-key
```

### Variables d'environnement Frontend
```bash
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 📱 Déploiement

### Railway (Production)
Le projet est configuré pour un déploiement automatique sur Railway avec :
- **Backend** : Configuration railway.yml
- **Frontend** : Build et serving automatique
- **Base de données** : PostgreSQL Railway

### Docker
```bash
# Production avec Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- 📧 Ouvrir une issue GitHub
- 📋 Consulter la documentation technique dans `/Backend/RAPPORT_MIGRATION.md`
- 🗺️ Vérifier les maquettes dans `/Frontend/maquette_web/` et `/Frontend/maquette_mobile/`

---

**Fait avec ❤️ pour démocratiser l'accès au sport en France**
