const startTime = Date.now(); // Démarrer le chronomètre
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const produitRoutes = require('./routes/produits');
const ventesRoutes = require('./routes/ventes');
const demandeVendeurRoutes = require('./routes/demandeVendeurRoutes');
const categoriesRoutes = require('./routes/categories');
const unitesRoutes = require('./routes/unites');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');
const vendeurRoutes = require('./routes/vendeurs');
const notificationRoutes = require('./routes/notificationRoutes');
const commandesRoutes = require('./routes/commandes');
const app = express();

const allowedOrigins = [
  'https://biyashara.hifadhui.site', // Frontend Vercel (prod)
  'http://localhost:3000'            // Développement local
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images des produits)
app.use('/api/v1/produits/images', express.static(path.join(__dirname, 'uploads/produits')));
const PORT = process.env.PORT || 5000;

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/produits', produitRoutes);
app.use('/api/v1/ventes', ventesRoutes);
app.use('/api/v1/demandes-vendeur', demandeVendeurRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/unites', unitesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vendeurs', vendeurRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/commandes', commandesRoutes);
app.use('/api/v1/livraisons', require('./routes/livraisons'));
app.use('/api/v1/factures', require('./routes/factures'));
app.use('/api/v1/paiements', require('./routes/paiements'));


// Gestionnaire d'erreurs global (doit être après les routes)
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Le serveur de test fonctionne !');
});


// Synchroniser les modèles et démarrer le serveur
const startServer = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  const attemptConnection = async () => {
    try {
      console.log(`🔄 Tentative de connexion à la base de données (${retryCount + 1}/${maxRetries})...`);
      
      // Afficher la configuration (sans le mot de passe)
      console.log('Configuration DB:', {
        host: sequelize.config.host,
        port: sequelize.config.port,
        database: sequelize.config.database,
        username: sequelize.config.username,
        dialect: sequelize.config.dialect
      });
      
      // Tester la connexion d'abord
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie avec succès.');
      
      // Synchroniser les modèles
      await sequelize.sync({ alter: true });
      console.log('✅ Les modèles ont été synchronisés avec la base de données.');

      // Démarrer le serveur
      app.listen(PORT, () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        const formattedTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        console.log(`✅ Serveur prêt et fonctionnel sur le port ${PORT}`);
        console.log(`🚀 Démarrage en ${formattedTime} | En cours à ${timeString}`);
      });
    } catch (error) {
      retryCount++;
      console.error(`❌ Erreur de connexion (tentative ${retryCount}/${maxRetries}):`, error.message);
      
      // Afficher plus de détails sur l'erreur
      if (error.original) {
        console.error('Détails de l\'erreur:', {
          code: error.original.code,
          errno: error.original.errno,
          sqlState: error.original.sqlState,
          sqlMessage: error.original.sqlMessage
        });
      }
      
      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Backoff exponentiel, max 30s
        console.log(`⏳ Nouvelle tentative dans ${delay/1000} secondes...`);
        setTimeout(attemptConnection, delay);
      } else {
        console.error('❌ Impossible de se connecter à la base de données après plusieurs tentatives.');
        console.error('Vérifiez vos variables d\'environnement et la connectivité réseau.');
        console.error('Suggestions de dépannage :');
        console.error('1. Vérifiez que DB_HOST, DB_USER, DB_PASSWORD, DB_NAME sont définis');
        console.error('2. Vérifiez que votre base de données Railway est active');
        console.error('3. Vérifiez que les informations de connexion sont correctes');
        process.exit(1);
      }
    }
  };

  await attemptConnection();
};

startServer();
