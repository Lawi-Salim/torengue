const { Commandes, DetailCommandes, Produits, Vendeurs, sequelize } = require('../models');

async function testCommandeProduction() {
  try {
    console.log('=== TEST COMMANDE PRODUCTION ===');
    
    // Trouver la dernière commande créée (la plus récente)
    const derniereCommande = await Commandes.findOne({
      order: [['id_commande', 'DESC']]
    });
    
    if (!derniereCommande) {
      console.log('❌ Aucune commande trouvée');
      return;
    }
    
    const commandeId = derniereCommande.id_commande;
    console.log('🔍 Test avec la dernière commande créée (ID:', commandeId, ')');
    
    // Test 1: Vérifier que la commande existe
    const commande = await Commandes.findByPk(commandeId);
    console.log('✅ Commande trouvée:', commande ? 'OUI' : 'NON');
    if (commande) {
      console.log('ID Commande:', commande.id_commande);
      console.log('Statut actuel:', commande.statut);
      console.log('ID Vendeur:', commande.id_vendeur);
      console.log('ID Client:', commande.id_client);
    } else {
      console.log('❌ Commande non trouvée');
      return;
    }
    
    // Test 2: Vérifier le vendeur
    const vendeur = await Vendeurs.findByPk(commande.id_vendeur);
    console.log('✅ Vendeur trouvé:', vendeur ? 'OUI' : 'NON');
    if (vendeur) {
      console.log('Vendeur ID:', vendeur.id_vendeur);
      console.log('Vendeur User ID:', vendeur.id_user);
      console.log('Nom boutique:', vendeur.nom_boutique);
    }
    
    // Test 3: Vérifier les détails de la commande
    const details = await DetailCommandes.findAll({
      where: { id_commande: commandeId },
      include: [{
        model: Produits,
        as: 'produit'
      }]
    });
    
    console.log('✅ Détails trouvés:', details.length);
    for (const detail of details) {
      console.log(`\n--- Détail ID: ${detail.id_detail} ---`);
      console.log('Produit ID:', detail.id_produit);
      console.log('Quantité:', detail.quantite);
      console.log('Prix unitaire:', detail.prix_unitaire);
      
      if (detail.produit) {
        console.log('Produit associé:', detail.produit.nom);
        console.log('Stock actuel:', detail.produit.stock_actuel);
        console.log('Prix produit:', detail.produit.prix_unitaire);
      } else {
        console.log('❌ Produit non associé');
      }
    }
    
    // Test 4: Simuler la validation (sans sauvegarder)
    console.log('\n=== SIMULATION VALIDATION ===');
    const nouveauStatut = 'validée';
    console.log('Nouveau statut:', nouveauStatut);
    
    // Vérifier si le statut est valide
    const statutsValides = ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée', 'validée'];
    console.log('Statut valide:', statutsValides.includes(nouveauStatut));
    
    // Vérifier si la commande peut être modifiée
    if (['livrée', 'annulée'].includes(commande.statut)) {
      console.log('❌ Commande déjà livrée ou annulée');
      return;
    }
    
    // Vérifier le stock pour chaque produit
    console.log('\n--- VÉRIFICATION STOCK ---');
    for (const detail of details) {
      if (detail.produit) {
        const stockActuel = parseInt(detail.produit.stock_actuel);
        const quantiteCommande = parseInt(detail.quantite);
        
        console.log(`Produit: ${detail.produit.nom}`);
        console.log(`Stock actuel: ${stockActuel}`);
        console.log(`Quantité commandée: ${quantiteCommande}`);
        console.log(`Stock suffisant: ${stockActuel >= quantiteCommande ? 'OUI' : 'NON'}`);
        
        if (stockActuel < quantiteCommande) {
          console.log('❌ Stock insuffisant');
          return;
        }
        
        const nouveauStock = stockActuel - quantiteCommande;
        console.log(`Nouveau stock après validation: ${nouveauStock}`);
      }
    }
    
    console.log('\n✅ Simulation réussie - La validation devrait fonctionner');
    console.log('=== FIN TEST ===');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le test
testCommandeProduction(); 