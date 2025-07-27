const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
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
const fs = require('fs'); // Added for fs.existsSync and fs.mkdirSync

// Multer config pour upload image produit
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/produits');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Dossier uploads/produits créé dans multer');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const { nom, id_vendeur } = req.body;
    // Si le nom ou l'ID du vendeur n'est pas fourni, on utilise un nom de fichier unique par défaut
    if (!nom || !id_vendeur) {
      return cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }

    const ext = path.extname(file.originalname);
    // On nettoie le nom du produit pour l'utiliser dans le nom de fichier
    const nomFichier = nom.replace(/\s+/g, '-').toLowerCase();
    const unique = uuidv4().slice(0, 4); // Ajoute une petite partie unique pour éviter les conflits

    cb(null, `${nomFichier}-${id_vendeur}-${unique}${ext}`);
  }
});
const upload = multer({ storage });

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
router.post('/', protect, authorize('vendeur', 'admin'), upload.single('image'), async (req, res) => {
  try {
    console.log('=== DÉBUT CRÉATION PRODUIT ===');
    console.log('Body reçu:', req.body);
    console.log('File reçu:', req.file);
    console.log('User:', req.user);

    const { nom, description, prix_unitaire, stock_actuel, id_categorie, id_unite, seuil_alerte, seuil_critique, id_vendeur } = req.body;
    
    // Validation des champs obligatoires
    if (!nom || !prix_unitaire || !stock_actuel) {
      console.log('❌ Champs obligatoires manquants');
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants: nom, prix_unitaire, stock_actuel sont requis.' 
      });
    }

    // Vérifier si l'utilisateur connecté a un profil vendeur
    let vendeurId = id_vendeur;
    if (!vendeurId) {
      const vendeur = await Vendeurs.findOne({ where: { id_user: req.user.id_user } });
      if (!vendeur) {
        console.log('❌ Utilisateur connecté n\'a pas de profil vendeur');
        return res.status(400).json({ 
          success: false, 
          message: 'Vous devez avoir un profil vendeur pour créer des produits.' 
        });
      }
      vendeurId = vendeur.id_vendeur;
    }

    console.log('Vendeur ID:', vendeurId);

    // Vérifier les clés étrangères si elles sont fournies
    if (id_categorie) {
      const categorie = await Categories.findByPk(id_categorie);
      if (!categorie) {
        console.log('❌ Catégorie non trouvée:', id_categorie);
        return res.status(400).json({ 
          success: false, 
          message: `Catégorie avec l'ID ${id_categorie} non trouvée.` 
        });
      }
    }

    if (id_unite) {
      const unite = await Unites.findByPk(id_unite);
      if (!unite) {
        console.log('❌ Unité non trouvée:', id_unite);
        return res.status(400).json({ 
          success: false, 
          message: `Unité avec l'ID ${id_unite} non trouvée.` 
        });
      }
    }

    const image = req.file ? req.file.filename : 'default.jpg';
    
    console.log('Données du produit à créer:', {
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      image,
      id_categorie: id_categorie || null,
      id_unite: id_unite || null,
      seuil_alerte: seuil_alerte || 10,
      seuil_critique: seuil_critique || 3,
      id_vendeur: vendeurId
    });

    const produit = await Produits.create({
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      image,
      id_categorie: id_categorie || null,
      id_unite: id_unite || null,
      seuil_alerte: seuil_alerte || 10,
      seuil_critique: seuil_critique || 3,
      id_vendeur: vendeurId
    });

    console.log('✅ Produit créé avec succès:', produit.id_produit);
    console.log('=== FIN CRÉATION PRODUIT ===');

    res.status(201).json({ success: true, data: produit });
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    console.error('Stack trace:', error.stack);
    
    // Gérer les erreurs spécifiques
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Erreur de clé étrangère. Vérifiez que la catégorie et l\'unité existent.' 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides: ' + error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création du produit.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { stock_actuel, seuil_alerte, seuil_critique } = req.body;
    const produit = await Produits.findByPk(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    if (stock_actuel !== undefined) produit.stock_actuel = stock_actuel;
    if (seuil_alerte !== undefined) produit.seuil_alerte = seuil_alerte;
    if (seuil_critique !== undefined) produit.seuil_critique = seuil_critique;
    await produit.save();
    res.json({ success: true, data: produit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
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