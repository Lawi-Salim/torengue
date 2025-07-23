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

// Multer config pour upload image produit
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/produits'));
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
    const { nom, description, prix_unitaire, stock_actuel, id_categorie, id_unite, seuil_alerte, seuil_critique, id_vendeur } = req.body;
    if (!nom || !prix_unitaire || !stock_actuel || !id_vendeur) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
    }
    const image = req.file ? req.file.filename : 'default.png';
    const produit = await Produits.create({
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      image,
      id_categorie,
      id_unite,
      seuil_alerte: seuil_alerte || 10,
      seuil_critique: seuil_critique || 3,
      id_vendeur
    });
    res.status(201).json({ success: true, data: produit });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
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