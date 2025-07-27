const { cloudinary } = require('../config/cloudinary');
const { Produits } = require('../models');
const path = require('path');
const fs = require('fs');

async function migrateImagesToCloudinary() {
  try {
    console.log('=== DÉBUT MIGRATION IMAGES VERS CLOUDINARY ===');
    
    // Récupérer tous les produits avec des images
    const produits = await Produits.findAll({
      where: {
        image: {
          [require('sequelize').Op.not]: null,
          [require('sequelize').Op.ne]: ''
        }
      }
    });
    
    console.log(`📋 ${produits.length} produits trouvés avec des images`);
    
    for (const produit of produits) {
      console.log(`\n--- Migration produit #${produit.id_produit}: ${produit.nom} ---`);
      
      // Vérifier si l'image est déjà une URL Cloudinary
      if (produit.image && produit.image.startsWith('http')) {
        console.log('✅ Image déjà sur Cloudinary:', produit.image);
        continue;
      }
      
      // Chemin vers l'image locale
      const imagePath = path.join(__dirname, '../uploads/produits', produit.image);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(imagePath)) {
        console.log('❌ Fichier image non trouvé:', imagePath);
        continue;
      }
      
      try {
        // Upload vers Cloudinary
        console.log('📤 Upload vers Cloudinary...');
        const result = await cloudinary.uploader.upload(imagePath, {
          folder: 'gestion-vente/produits',
          public_id: `produit-${produit.id_produit}-${Date.now()}`,
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        
        // Mettre à jour la base de données
        await produit.update({ image: result.secure_url });
        
        console.log('✅ Image migrée avec succès:', result.secure_url);
        
        // Supprimer le fichier local (optionnel)
        // fs.unlinkSync(imagePath);
        // console.log('🗑️  Fichier local supprimé');
        
      } catch (uploadError) {
        console.error('❌ Erreur lors de l\'upload:', uploadError.message);
      }
    }
    
    console.log('\n=== FIN MIGRATION IMAGES ===');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    process.exit(0);
  }
}

// Exécuter la migration
migrateImagesToCloudinary(); 