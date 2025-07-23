# Gestion-Vente - Application de Gestion de Vente de Produits de Construction

Une application complète de gestion de vente spécialisée dans les produits de construction, construite avec React, Express, et MySQL.

---

## 🏗️ Architecture du projet

```
Gestion-vente/
├── backend/                 # API Express.js
│   ├── config/             # Configuration base de données
│   ├── models/             # Modèles Sequelize
│   ├── controllers/        # Contrôleurs API
│   ├── routes/             # Routes Express
│   ├── middleware/         # Middleware personnalisé
│   └── scripts/            # Scripts utilitaires
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── context/        # Context React
│   │   └── services/       # Services API
└── database/               # Schéma de base de données
```

---

## 🚀 Technologies Utilisées

### Backend
- **Express.js**
- **Sequelize** (ORM MySQL)
- **MySQL2**
- **bcryptjs**
- **jsonwebtoken**
- **express-validator**
- **multer**
- **helmet**
- **cors**

### Frontend
- **React 18**
- **React Router**
- **Axios**
- **React Query**
- **React Hook Form**
- **CSS personnalisé**
- **React Icons**
- **React Hot Toast**

---

## 📋 Prérequis
- Node.js (v16 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

---

## 🛠️ Installation locale

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd Gestion-vente
```

### 2. Configuration de la base de données
```sql
CREATE DATABASE gestion_produits;
```

### 3. Configuration Backend
```bash
cd backend
npm install
cp env.example .env
```
**Exemple de backend/.env :**
```
PORT=5000
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=motdepasse
DB_NAME=gestion_produits
JWT_SECRET=VOTRE_SECRET_JWT
JWT_EXPIRES_IN=90d
```

### 4. Configuration Frontend
```bash
cd ../frontend
npm install
cp env.example .env
```
**Exemple de frontend/.env :**
```
REACT_APP_API_URL=http://localhost:5000
```

### 5. Démarrer l'application en local
**Backend :**
```bash
cd backend
npm run dev
```
**Frontend :**
```bash
cd frontend
npm start
```

---

## 🚀 Déploiement

### Déploiement Backend sur Railway
1. Crée un compte sur [Railway](https://railway.app/).
2. Crée un nouveau projet et connecte ton repo GitHub.
3. Configure les variables d'environnement dans Railway :
   - `PORT`
   - `DB_HOST` (URL Railway ou autre)
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Déploie le projet (Railway installe et lance automatiquement le serveur).
5. Récupère l'URL publique Railway (ex : https://gestion-vente-backend.up.railway.app).

### Déploiement Frontend sur Vercel
1. Crée un compte sur [Vercel](https://vercel.com/).
2. Crée un nouveau projet et connecte ton repo GitHub.
3. Configure la variable d'environnement dans Vercel :
   - `REACT_APP_API_URL=https://gestion-vente-backend.up.railway.app`
4. Déploie (Vercel build et héberge automatiquement le frontend).
5. Vérifie que le frontend communique bien avec le backend Railway.

### Connexion Frontend/Backend
- **CORS** : Assure-toi que le backend autorise le domaine Vercel (voir middleware CORS dans Express).
- **URL d’API** : Mets à jour `REACT_APP_API_URL` dans Vercel avec l’URL Railway (pas `localhost` en production).

---

## 📊 Structure de la Base de Données

L’application utilise les tables suivantes :
- Utilisateurs
- Vendeurs
- Clients
- Produits
- Catégories
- Unités
- Commandes
- Ventes
- Factures
- Paiements
- Livraisons
- Notifications

---

## 🔐 Authentification
- JWT sécurisé
- Trois rôles : admin, vendeur, client

---

## 📝 API Endpoints principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Produits
- `GET /api/produits` - Liste des produits
- `POST /api/produits` - Créer un produit
- `PUT /api/produits/:id` - Modifier un produit
- `DELETE /api/produits/:id` - Supprimer un produit

### Ventes
- `GET /api/ventes` - Liste des ventes
- `POST /api/ventes` - Créer une vente
- `GET /api/ventes/:id` - Détails d'une vente

---

## 🧹 Nettoyage & Bonnes pratiques
- **Ne jamais versionner les fichiers `.env` réels**
- **Ne jamais exposer de secrets dans le frontend**
- **Supprimer les fichiers inutiles avant le déploiement**
- **Vérifier les logs Railway/Vercel en cas de souci**
- **Mettre à jour le `.gitignore` pour ignorer les fichiers/dossiers sensibles ou inutiles**

---

## 🤝 Contribution
1. Fork le projet
2. Crée une branche feature (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commit tes changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvre une Pull Request

---

## 📄 Licence
Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour la gestion de vente de produits de construction**
# torengue
