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
  'https://nada.hifadhui.site',      // Nouveau frontend Vercel (prod)
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
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Les modèles ont été synchronisés avec la base de données.');

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
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1); // Arrêter le processus en cas d'échec de la synchronisation
  }
};

startServer();
