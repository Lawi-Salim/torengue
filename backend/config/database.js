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
  dialectOptions: { // Initialisation au bon niveau
    collate: 'utf8mb4_unicode_ci',
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
  },
};

// Activer SSL uniquement pour l'environnement de production
if (env === 'production') {
  options.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false // Nécessaire pour les certificats auto-signés de certains services cloud
  };
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  options
);

module.exports = sequelize; 