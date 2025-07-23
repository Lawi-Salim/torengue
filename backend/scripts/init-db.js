const { sequelize, initializeModels } = require('../models');

const initDatabase = async () => {
  try {
    console.log('🔄 Synchronisation des modèles avec la base de données...');
    await initializeModels();
    console.log('✅ Modèles synchronisés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase; 