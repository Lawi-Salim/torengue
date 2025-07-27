const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  getAllProduits,
  getProduit,
  createProduit,
  updateProduit,
  deleteProduit
} = require('../controllers/produitsController');
const { protect, authorize } = require('../middleware/auth');
const { Produits, Categories, Unites, Vendeurs } = require('../models');
const { upload } = require('../config/cloudinary');

// Routes publiques
// La route '/all' doit être déclarée AVANT la route '/:id' pour éviter que 'all' ne soit interprété comme un ID.
router.get('/all', protect, authorize('admin', 'client'), async (req, res) => {
  // console.log('--- [ADMIN] Appel de la route /api/v1/produits/all ---');
  // console.log('Utilisateur authentifié:', req.user);
  try {
    const produits = await Produits.findAll({
      include: [{
        model: Vendeurs,
        as: 'vendeur', // Correction: ajout de l'alias défini dans models/index.js
        attributes: ['nom_boutique'],
        required: true
      }, {
        model: Categories,
        as: 'categorie',
        attributes: ['nom'],
        required: false // Utiliser false pour ne pas exclure les produits sans catégorie
      }, {
        model: Unites,
        as: 'unite',
        attributes: ['nom'],
        required: false
      }],

      order: [['date_creation', 'DESC']] // Correction: la colonne est 'date_creation' et non 'createdAt'
    });
    // console.log(`Nombre de produits trouvés: ${produits.length}`);
    res.json({ success: true, data: produits });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les produits:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.route('/')
  .get(getAllProduits);

router.route('/:id')
  .get(getProduit);

// Endpoint pour créer un produit avec image
router.post('/', protect, authorize('vendeur'), upload.single('image'), async (req, res) => {
  try {
    console.log('=== DÉBUT CRÉATION PRODUIT ===');
    console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file);
    console.log('User:', req.user);

    const { nom, description, prix_unitaire, stock_actuel, id_categorie, id_unite, seuil_alerte, seuil_critique, id_vendeur } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !prix_unitaire || !stock_actuel || !id_categorie || !id_unite) {
      console.log('❌ Champs obligatoires manquants');
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants: nom, prix_unitaire, stock_actuel, id_categorie, id_unite sont requis.' 
      });
    }

    // Seuls les vendeurs peuvent créer des produits
    if (req.user.role !== 'vendeur') {
      console.log('❌ Utilisateur non autorisé à créer des produits');
      return res.status(403).json({
        success: false,
        message: 'Seuls les vendeurs peuvent créer des produits.'
      });
    }

    // Récupérer l'ID du vendeur connecté
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur) {
      console.log('❌ Utilisateur connecté n\'a pas de profil vendeur');
      return res.status(400).json({
        success: false,
        message: 'Vous devez avoir un profil vendeur pour créer des produits.'
      });
    }

    const vendeurId = vendeur.id_vendeur;
    console.log('Vendeur ID:', vendeurId);

    // Vérifier que la catégorie existe
    const categorie = await Categories.findByPk(id_categorie);
    if (!categorie) {
      console.log('❌ Catégorie non trouvée');
      return res.status(400).json({
        success: false,
        message: 'Catégorie sélectionnée invalide.'
      });
    }

    // Vérifier que l'unité existe
    const unite = await Unites.findByPk(id_unite);
    if (!unite) {
      console.log('❌ Unité non trouvée');
      return res.status(400).json({
        success: false,
        message: 'Unité sélectionnée invalide.'
      });
    }

    const image = req.file ? req.file.path : null;
    console.log('=== INFOS FICHIER IMAGE CLOUDINARY ===');
    console.log('Fichier reçu:', req.file);
    console.log('URL Cloudinary:', image);
    console.log('=== FIN INFOS FICHIER IMAGE CLOUDINARY ===');

    const produit = await Produits.create({
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      id_categorie,
      id_unite,
      seuil_alerte: seuil_alerte || 10,
      seuil_critique: seuil_critique || 3,
      id_vendeur: vendeurId,
      image
    });

    console.log('✅ Produit créé avec succès:', produit.id_produit);
    res.status(201).json({ 
      success: true, 
      message: 'Produit créé avec succès.',
      data: produit 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du produit:', error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Référence invalide (catégorie, unité ou vendeur inexistant).'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides. Vérifiez les valeurs saisies.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création du produit.' 
    });
  }
});

// Endpoint pour modifier un produit avec image
router.put('/:id', protect, authorize('vendeur'), upload.single('image'), async (req, res) => {
  try {
    console.log('=== DÉBUT MODIFICATION PRODUIT ===');
    console.log('ID Produit:', req.params.id);
    console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file);
    console.log('User:', req.user);

    const { nom, description, prix_unitaire, stock_actuel, id_categorie, id_unite, seuil_alerte, seuil_critique } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !prix_unitaire || !stock_actuel || !id_categorie || !id_unite) {
      console.log('❌ Champs obligatoires manquants');
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants: nom, prix_unitaire, stock_actuel, id_categorie, id_unite sont requis.' 
      });
    }

    // Récupérer le produit à modifier
    const produit = await Produits.findByPk(req.params.id);
    if (!produit) {
      console.log('❌ Produit non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé.'
      });
    }

    // Vérifier que le vendeur connecté est le propriétaire du produit
    const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
    if (!vendeur || vendeur.id_vendeur !== produit.id_vendeur) {
      console.log('❌ Vendeur non autorisé à modifier ce produit');
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier ce produit.'
      });
    }

    // Vérifier que la catégorie existe
    const categorie = await Categories.findByPk(id_categorie);
    if (!categorie) {
      console.log('❌ Catégorie non trouvée');
      return res.status(400).json({
        success: false,
        message: 'Catégorie sélectionnée invalide.'
      });
    }

    // Vérifier que l'unité existe
    const unite = await Unites.findByPk(id_unite);
    if (!unite) {
      console.log('❌ Unité non trouvée');
      return res.status(400).json({
        success: false,
        message: 'Unité sélectionnée invalide.'
      });
    }

    // Gérer l'image
    let image = produit.image; // Garder l'image existante par défaut
    if (req.file) {
      image = req.file.path;
      console.log('Nouvelle image Cloudinary:', image);
    }

    // Mettre à jour le produit
    await produit.update({
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      id_categorie,
      id_unite,
      seuil_alerte: seuil_alerte || 10,
      seuil_critique: seuil_critique || 3,
      image
    });

    console.log('✅ Produit modifié avec succès');
    res.json({ 
      success: true, 
      message: 'Produit modifié avec succès.',
      data: produit 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la modification du produit:', error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Référence invalide (catégorie, unité ou vendeur inexistant).'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides. Vérifiez les valeurs saisies.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la modification du produit.' 
    });
  }
});

// Endpoint pour récupérer les produits d'un vendeur
router.get('/vendeur/:id', protect, authorize('vendeur', 'admin'), async (req, res) => {
  try {
    const produits = await Produits.findAll({ where: { id_vendeur: req.params.id } });
    res.json({ success: true, data: produits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});



// Endpoint pour modifier le stock et les seuils d'un produit
router.patch('/:id/stock', protect, authorize('vendeur', 'admin'), async (req, res) => {
  try {
    console.log('=== DÉBUT MODIFICATION STOCK ===');
    console.log('ID Produit:', req.params.id);
    console.log('Body reçu:', req.body);
    console.log('User:', req.user);

    const { stock_actuel, seuil_alerte, seuil_critique } = req.body;
    
    // Validation des données
    if (stock_actuel !== undefined && (isNaN(stock_actuel) || stock_actuel < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Le stock doit être un nombre positif.'
      });
    }
    
    if (seuil_alerte !== undefined && (isNaN(seuil_alerte) || seuil_alerte < 10)) {
      return res.status(400).json({
        success: false,
        message: 'Le seuil d\'alerte doit être au moins 10.'
      });
    }
    
    if (seuil_critique !== undefined && (isNaN(seuil_critique) || seuil_critique < 3)) {
      return res.status(400).json({
        success: false,
        message: 'Le seuil critique doit être au moins 3.'
      });
    }
    
    if (seuil_alerte !== undefined && seuil_critique !== undefined && seuil_critique >= seuil_alerte) {
      return res.status(400).json({
        success: false,
        message: 'Le seuil critique doit être inférieur au seuil d\'alerte.'
      });
    }

    // Récupérer le produit
    const produit = await Produits.findByPk(req.params.id);
    if (!produit) {
      console.log('❌ Produit non trouvé');
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé.' 
      });
    }

    // Vérifier que le vendeur connecté est le propriétaire du produit (sauf pour l'admin)
    if (req.user.role === 'vendeur') {
      const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
      if (!vendeur || vendeur.id_vendeur !== produit.id_vendeur) {
        console.log('❌ Vendeur non autorisé à modifier ce produit');
        return res.status(403).json({
          success: false,
          message: 'Vous n\'êtes pas autorisé à modifier ce produit.'
        });
      }
    }

    // Mettre à jour les champs
    if (stock_actuel !== undefined) produit.stock_actuel = stock_actuel;
    if (seuil_alerte !== undefined) produit.seuil_alerte = seuil_alerte;
    if (seuil_critique !== undefined) produit.seuil_critique = seuil_critique;
    
    await produit.save();
    
    console.log('✅ Stock mis à jour avec succès');
    console.log('=== FIN MODIFICATION STOCK ===');
    
    res.json({ 
      success: true, 
      message: 'Stock mis à jour avec succès.',
      data: produit 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification du stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la modification du stock.' 
    });
  }
});

// Route de test pour vérifier les images (maintenant obsolète avec Cloudinary)
router.get('/test-image/:filename', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Cette route est obsolète. Les images sont maintenant stockées sur Cloudinary.'
  });
});

// Route pour récupérer les catégories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Categories.findAll({
      order: [['nom', 'ASC']]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// Route pour récupérer les unités
router.get('/unites/list', async (req, res) => {
  try {
    const unites = await Unites.findAll({
      order: [['nom', 'ASC']]
    });
    res.json({ success: true, data: unites });
  } catch (error) {
    console.error('Erreur lors de la récupération des unités:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;