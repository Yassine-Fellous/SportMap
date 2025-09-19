# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 🏃‍♂️ SportMap - Cartographie Interactive des Infrastructures Sportives

Une Progressive Web App (PWA) pour cartographier et évaluer toutes les infrastructures sportives en France de manière collaborative et interactive.

## 🎯 Vision du Projet

SportMap démocratise l'accès au sport en France en créant la première plateforme collaborative de cartographie des équipements sportifs. Notre mission est de connecter les sportifs aux infrastructures disponibles tout en permettant à la communauté de maintenir et améliorer ces données en temps réel.

## 🚀 Fonctionnalités Actuelles

### ✅ Version Actuelle
- **Carte interactive** avec Mapbox GL JS
- **5800+ équipements sportifs** référencés Dans les Bouches du Rhone
- **168 sports** différents catalogués
- **Recherche et filtres** par sport, localisation
- **Interface responsive** adaptée mobile/desktop
- **Géolocalisation** de l'utilisateur

### 🔧 Problèmes Connus à Résoudre
- **Pagination dans les popups** : Plusieurs équipements au même point
- **Token Mapbox** : Configuration requise pour l'affichage

## 📱 Architecture Technique

```
Frontend: React + Vite + TailwindCSS
Cartographie: Mapbox GL JS
API: RESTful + GeoJSON
```

## 🗺️ Roadmap V1 - Objectifs Immédiats

### Phase 1: Évolution PWA ⭐ *Priorité Absolue*
- [ ] **Configuration PWA** (manifest.json + service worker)
- [ ] **Installation** sur écran d'accueil mobile
- [ ] **Interface responsive** optimisée mobile
- [ ] **Notifications push** basiques

### Phase 2: Authentification ⭐ *Priorité*
- [ ] **Système d'authentification** email - password
- [ ] **Gestion des utilisateurs** et profils basiques
- [ ] **Tokens de session** sécurisés
- [ ] **Hooks d'authentification** React
- [ ] **Persistance sécurisée** des sessions

### Phase 3: Système de Signalement ⭐ *Priorité*
- [ ] **API de signalement** pour les problèmes d'équipements
- [ ] **Types de problèmes** (maintenance, sécurité, propreté)
- [ ] **Statuts de résolution** (ouvert, en cours, résolu)
- [ ] **Système de modération** basique
- [ ] **Modal de signalement** React
- [ ] **Notifications** aux gestionnaires

### Phase 4: Améliorations UX/UI
- [ ] **Contrôles mobiles** optimisés
- [ ] **Pagination des popups** (résoudre le problème actuel)
- [ ] **Animations fluides** et transitions
- [ ] **Feedback utilisateur** en temps réel
- [ ] **États de chargement** améliorés

---

## 🚀 Roadmap V2 - Fonctionnalités Avancées

### Phase 1: Infrastructure Backend
- [ ] **Base de données** avec géolocalisation
- [ ] **API endpoints** RESTful complets
- [ ] **Système de logs** et monitoring
- [ ] **Tests unitaires** et d'intégration
- [ ] **Documentation API** complète
- [ ] **Gestion des erreurs** robuste
- [ ] **Rate limiting** et sécurité

### Phase 2: Profils Utilisateurs Complets
- [ ] **Connexion sociale** (Google, Apple)
- [ ] **Profils utilisateurs** avec spécialités sportives
- [ ] **Niveaux de pratique** (débutant, intermédiaire, expert)
- [ ] **Paramètres de confidentialité**
- [ ] **Tableau de bord personnel**
- [ ] **Préférences de notification**

### Phase 3: Système de Review et Évaluation
- [ ] **Système de notation** (équipement, sécurité, propreté)
- [ ] **Commentaires détaillés** avec photos
- [ ] **Upload d'images** récentes des installations
- [ ] **Indicateur d'affluence** par horaire
- [ ] **Modération communautaire** des reviews
- [ ] **Badges "Reviewer certifié"**

### Phase 4: Collaboration Avancée
- [ ] **Ajout de nouveaux spots** par la communauté
- [ ] **Système de validation** communautaire
- [ ] **Points de contribution** pour les mises à jour validées
- [ ] **Dashboard des contributions**
- [ ] **Statut en temps réel** des installations

### Phase 5: Fonctionnalités PWA Avancées
- [ ] **Mode hors-ligne** avec cache intelligent
- [ ] **Synchronisation différée** des données
- [ ] **Cache des cartes** pour usage offline
- [ ] **Géolocalisation hors-ligne**

### Phase 6: Social & Networking
- [ ] **Système de follow** entre utilisateurs
- [ ] **Messagerie intégrée**
- [ ] **Feed d'activités** personnalisé
- [ ] **Recommandations** de partenaires d'entraînement
- [ ] **Groupes par sport/niveau**
- [ ] **Partage d'activités** sur les réseaux

### Phase 7: Itinéraires d'Entraînement
- [ ] **Création de circuits** personnalisés
- [ ] **Calcul de distance** et temps estimé
- [ ] **Difficulté par niveau** (débutant à expert)
- [ ] **Partage d'itinéraires** avec la communauté
- [ ] **Favoris et collections** personnelles
- [ ] **Export GPX/KML** pour montres connectées

### Phase 8: Gamification
- [ ] **Défis hebdomadaires** par spot
- [ ] **Classements et leaderboards**
- [ ] **Badges et récompenses** gamifiées
- [ ] **Validation des performances**
- [ ] **Historique des challenges**
- [ ] **Statistiques personnelles** détaillées

### Phase 9: Événements Communautaires
- [ ] **Création d'événements** sportifs
- [ ] **Système d'inscription** en ligne
- [ ] **Notifications et rappels** automatiques
- [ ] **Chat de groupe** par événement
- [ ] **Historique des participations**
- [ ] **Suggestions personnalisées** d'événements

## 🛠️ Installation et Développement

### Prérequis
- Node.js 18+ et npm
- Token Mapbox (gratuit)
- Accès à l'API SportMap

### Installation
```bash
# Cloner le projet
git clone https://github.com/mathieu-duverne/sport-marseille.git
cd sport-marseille

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Ajouter votre MAPBOX_TOKEN dans .env

# Démarrer le serveur de développement
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Vérification ESLint
```

## 🌐 API et Données

### Endpoints Actuels
- `GET /api/geojson` - Équipements sportifs (format GeoJSON)
- `GET /api/sports` - Liste des sports disponibles

### Endpoints V1 (en développement)
- `POST /api/auth/magic-link` - Authentification passwordless
- `GET /api/auth/verify/{token}` - Vérification du token magique
- `POST /api/auth/logout` - Déconnexion
- `GET /api/user/profile` - Profil utilisateur
- `POST /api/reports` - Signalement de problèmes
- `GET /api/reports` - Liste des signalements
- `PATCH /api/reports/{id}` - Mise à jour statut signalement

### Endpoints V2 (à venir)
- `GET /api/reviews` - Évaluations des spots
- `POST /api/reviews` - Ajouter une évaluation
- `GET /api/events` - Événements sportifs

## 🔄 Processus Build in Public

### Communication Transparente
- **Documentation régulière** des avancées sur LinkedIn
- **Partage des métriques** et retours utilisateurs
- **Sessions de feedback** avec la communauté
- **Mise en avant** des contributeurs
- **Transparence** sur les défis techniques
- **Célébration des milestones** avec la communauté

### Métriques Clés V1
- Nombre d'équipements référencés
- Temps de chargement de la carte
- Taux d'adoption PWA
- Signalements communautaires traités
- Utilisateurs authentifiés

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créer une branche** feature (`git checkout -b feature/ma-nouvelle-fonctionnalite`)
3. **Commiter** les changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. **Pousser** vers la branche (`git push origin feature/ma-nouvelle-fonctionnalite`)
5. **Ouvrir une Pull Request**

### Guidelines
- Respecter les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements significatifs
- Suivre les principes d'accessibilité (WCAG)

## 📊 Statistiques du Projet

- **5825 équipements** sportifs référencés
- **168 sports** différents catalogués  
- **Marseille** entièrement cartographiée
- **Expansion** prévue sur toute la France

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Liens Utiles

- [Application Live](https://sport-marseille.netlify.app)
- [Documentation API](https://apisportmap-production.up.railway.app/api)
- [Mapbox Documentation](https://docs.mapbox.com)
- [React Documentation](https://react.dev)

---

## 🙏 Remerciements

- **Communauté open source** pour les outils utilisés
- **Contributeurs** présents et futurs
- **Utilisateurs** qui testent et donnent leurs retours
- **Département des Bouches du Rhone** pour l'ouverture des données

---

**Focus V1** : PWA basique + Authentification passwordless + Système de signalement

**Suivi du projet** : [LinkedIn](https://linkedin.com/in/mathieu-duverne) | [GitHub](https://github.com/mathieu-duverne)

**#BuildInPublic #SportTech #OpenSource #React #PWA**

**Note** : Ce projet est développé dans le cadre d'une approche Build in Public. L'idée originale et les innovations techniques restent la propriété de l'auteur.