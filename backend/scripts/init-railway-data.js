const { 
  sequelize, 
  Categories, 
  Unites, 
  Utilisateurs, 
  Clients, 
  Vendeurs 
} = require('../models');
const bcrypt = require('bcryptjs');

// Variable globale pour éviter les initialisations multiples dans la même session
let isInitialized = false;

const initRailwayData = async () => {
  // Éviter les initialisations multiples dans la même session
  if (isInitialized) {
    console.log('ℹ️ Initialisation déjà effectuée dans cette session.');
    return;
  }

  try {
    console.log('🚀 Vérification des données de base sur Railway...');

    // Vérifier si les données existent déjà
    const categoriesCount = await Categories.count();
    const unitesCount = await Unites.count();
    const adminExists = await Utilisateurs.findOne({ 
      where: { email: 'dahlawi@gmail.com' } 
    });

    // Si toutes les données existent déjà, ne rien faire
    if (categoriesCount >= 6 && unitesCount >= 7 && adminExists) {
      console.log('✅ Toutes les données de base existent déjà. Aucune initialisation nécessaire.');
      isInitialized = true;
      return;
    }

    console.log('📝 Initialisation des données manquantes...');

    // Créer les catégories si elles n'existent pas
    const categories = [
      { nom: 'Bois' },
      { nom: 'Électricité' },
      { nom: 'Plomberie' },
      { nom: 'Isolation' },
      { nom: 'Peinture' },
      { nom: 'Sécurité' }
    ];
    
    for (const categorie of categories) {
      await Categories.findOrCreate({
        where: { nom: categorie.nom },
        defaults: categorie
      });
    }
    console.log('✅ Catégories vérifiées/créées');

    // Créer les unités si elles n'existent pas
    const unites = [
      { nom: 'Mètre', symbole: 'm' },
      { nom: 'Pièce', symbole: 'pcs' },
      { nom: 'Bobine', symbole: 'bob' },
      { nom: 'Mètre carré', symbole: 'm²' },
      { nom: 'Rouleau', symbole: 'roul' },
      { nom: 'Litre', symbole: 'L' },
      { nom: 'Pot', symbole: 'pot' },
    ];
    
    for (const unite of unites) {
      await Unites.findOrCreate({
        where: { nom: unite.nom, symbole: unite.symbole },
        defaults: unite
      });
    }
    console.log('✅ Unités vérifiées/créées');

    // Créer un utilisateur admin par défaut s'il n'existe pas
    if (!adminExists) {
      const adminUser = await Utilisateurs.create({
        nom: 'dahlawi',
        email: 'dahlawi@gmail.com',
        password_hash: '123456',
        role: 'admin',
        telephone: '+269 434 00 04'
      });
      console.log('✅ Utilisateur admin créé');
    } else {
      console.log('ℹ️ Utilisateur admin existe déjà');
    }

    isInitialized = true;
    console.log('🎉 Initialisation terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
    throw error; // Propager l'erreur au lieu d'arrêter le processus
  }
};

// Fermer la connexion seulement si le script est exécuté directement
if (require.main === module) {
  initRailwayData()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    return sequelize.close();
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
}

module.exports = initRailwayData; 