const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const options = {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  timezone: dbConfig.timezone,
  pool: dbConfig.pool,
  sync: false,
  dialectOptions: {
    connectTimeout: 60000, // 60 secondes
    charset: 'utf8mb4'
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  retry: {
    max: 5, // Nombre maximum de tentatives de reconnexion
    timeout: 3000 // Délai entre les tentatives
  }
};

// Activer SSL uniquement pour l'environnement de production
if (env === 'production') {
  options.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false // Nécessaire pour les certificats auto-signés de certains services cloud
  };
  
  // Configuration spécifique pour la production
  options.pool = {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 30000
  };
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  options
);

module.exports = sequelize; 