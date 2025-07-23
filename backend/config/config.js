require('dotenv').config();

module.exports = {
  development: {
    username: 'root',
    password: 'nadalawi',
    database: 'gestion_produits',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '+01:00'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'gestion_produits_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}; 