const { sequelize } = require('./models');

async function testConnection() {
  try {
    console.log('=== TEST CONNEXION BASE DE DONNÉES ===');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');
    
    // Test simple de requête
    const result = await sequelize.query('SELECT 1 as test');
    console.log('✅ Requête de test réussie:', result[0]);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 