const { Commandes, DetailCommandes, Produits, sequelize } = require('../models');

async function testCommandeRelations() {
  try {
    console.log('=== TEST DES RELATIONS COMMANDES ===');
    
    // Test 1: Récupérer une commande avec ses détails
    const commande = await Commandes.findByPk(3, {
      include: [{
        model: DetailCommandes,
        as: 'details'
      }]
    });
    
    console.log('✅ Commande trouvée:', commande ? 'OUI' : 'NON');
    if (commande) {
      console.log('ID Commande:', commande.id_commande);
      console.log('Statut:', commande.statut);
      console.log('Nombre de détails:', commande.details ? commande.details.length : 0);
      
      if (commande.details && commande.details.length > 0) {
        console.log('\n--- Détails de la commande ---');
        for (const detail of commande.details) {
          console.log(`Détail ID: ${detail.id_detail}`);
          console.log(`Produit ID: ${detail.id_produit}`);
          console.log(`Quantité: ${detail.quantite}`);
          console.log(`Prix: ${detail.prix_unitaire}`);
        }
      }
    }
    
    // Test 2: Récupérer les détails avec les produits
    const details = await DetailCommandes.findAll({
      where: { id_commande: 3 },
      include: [{
        model: Produits,
        as: 'produit'
      }]
    });
    
    console.log('\n--- Détails avec produits ---');
    console.log('Nombre de détails trouvés:', details.length);
    
    for (const detail of details) {
      console.log(`\nDétail ID: ${detail.id_detail}`);
      console.log(`Produit associé: ${detail.produit ? 'OUI' : 'NON'}`);
      if (detail.produit) {
        console.log(`  - Nom: ${detail.produit.nom}`);
        console.log(`  - Stock: ${detail.produit.stock_actuel}`);
        console.log(`  - Prix: ${detail.produit.prix_unitaire}`);
      }
    }
    
    // Test 3: Vérifier les produits directement
    console.log('\n--- Vérification des produits ---');
    const produits = await Produits.findAll({
      where: {
        id_produit: details.map(d => d.id_produit)
      }
    });
    
    console.log('Produits trouvés:', produits.length);
    for (const produit of produits) {
      console.log(`- ${produit.nom} (ID: ${produit.id_produit}, Stock: ${produit.stock_actuel})`);
    }
    
    console.log('\n=== FIN TEST ===');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le test
testCommandeRelations(); 