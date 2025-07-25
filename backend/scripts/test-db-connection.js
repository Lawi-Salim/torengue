const sequelize = require('../config/database');

const testConnection = async () => {
  try {
    console.log('🔄 Test de connexion à la base de données...');
    console.log('Configuration:', {
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database,
      username: sequelize.config.username,
      dialect: sequelize.config.dialect
    });
    
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');
    
    // Tester une requête simple
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Requête de test réussie:', result[0]);
    
    await sequelize.close();
    console.log('✅ Connexion fermée proprement.');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Détails:', error);
    process.exit(1);
  }
};

testConnection(); 