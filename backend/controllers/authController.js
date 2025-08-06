const { Utilisateurs, Vendeurs, Clients, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('[AUTH] Tentative de connexion pour :', email);
  try {
    if (!email || !password) {
      console.warn('[AUTH] Email ou mot de passe manquant');
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }
    const user = await Utilisateurs.findOne({ where: { email } });
    if (!user) {
      console.warn(`[AUTH] Utilisateur non trouvé : ${email}`);
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn(`[AUTH] Mot de passe incorrect pour : ${email}`);
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }
    // Générer un token JWT
    const token = jwt.sign(
      { id_user: user.id_user, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log(`[AUTH] Connexion réussie pour : ${email}`);
    res.json({
      success: true,
      token: token,
      data: {
        user: {
          id_user: user.id_user,
          nom: user.nom,
          email: user.email,
          role: user.role,
          telephone: user.telephone
        }
      }
    });
  } catch (error) {
    console.error('[AUTH] Erreur lors de la connexion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion.' });
  }
};



exports.register = async (req, res) => {
  const { nom, email, password, telephone, role, vendeurData, adresse_facturation } = req.body;

  // Validation simple
  if (!nom || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Les champs nom, email, mot de passe et rôle sont requis.' });
  }

  const t = await sequelize.transaction();
  console.log('[AUTH REGISTER] Transaction démarrée.');

  try {
    // Vérifier si l'utilisateur existe déjà par email
    const existingUserByEmail = await Utilisateurs.findOne({ where: { email } });
    if (existingUserByEmail) {
      console.log(`[AUTH REGISTER] Tentative d'inscription échouée : l'email ${email} existe déjà.`);
      await t.rollback();
      return res.status(409).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Vérifier si le téléphone existe déjà
    if (telephone) {
      const existingUserByPhone = await Utilisateurs.findOne({ where: { telephone } });
      if (existingUserByPhone) {
        console.log(`[AUTH REGISTER] Tentative d'inscription échouée : le téléphone ${telephone} existe déjà.`);
        await t.rollback();
        return res.status(409).json({ success: false, message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
      }
    }

    // Créer un nouvel utilisateur
    console.log(`[AUTH REGISTER] Création de l'utilisateur pour ${email}...`);
    console.log(`[AUTH REGISTER] Création de l'utilisateur pour ${email}...`);
    const newUser = await Utilisateurs.create({
      nom,
      email,
      password_hash: password, // On passe le mot de passe brut, le modèle va le hacher
      telephone,
      role
    }, { transaction: t });
    console.log(`[AUTH REGISTER] Utilisateur créé avec l'ID: ${newUser.id_user}`);

    // Créer un vendeur ou un client associé
    if (role === 'vendeur') {
      if (!vendeurData || !vendeurData.nom_boutique) {
        throw new Error('Les données de la boutique sont requises pour un vendeur.');
      }
      console.log(`[AUTH REGISTER] Création du profil vendeur pour l'utilisateur ID: ${newUser.id_user}...`);
      await Vendeurs.create({
        id_user: newUser.id_user,
        nom_boutique: vendeurData.nom_boutique,
        nationalite: vendeurData.nationalite,
        description: vendeurData.description,
        adresse: vendeurData.adresse,
        statut: 'pending' // Le statut est en attente par défaut
      }, { transaction: t });
      console.log(`[AUTH REGISTER] Profil vendeur créé avec statut 'pending'.`);

      // Créer une notification pour les admins
      const admins = await Utilisateurs.findAll({ where: { role: 'admin' }, transaction: t });
      if (admins.length > 0) {
        const notifications = admins.map(admin => ({
          message: `Nouvelle demande de vendeur de ${newUser.nom}.`,
          type_notif: 'demande_vendeur',
          id_user: admin.id_user
        }));
        // La gestion des notifications sera ajoutée ici si nécessaire
        console.log(`[AUTH REGISTER] Notification de demande de vendeur créée pour ${admins.length} admin(s).`);
      }
    } else if (role === 'client') {
      console.log(`[AUTH REGISTER] Création du profil client pour l'utilisateur ID: ${newUser.id_user}...`);
      await Clients.create({ adresse_facturation, id_user: newUser.id_user }, { transaction: t });
      console.log(`[AUTH REGISTER] Profil client créé.`);
    }

    await t.commit();
    console.log('[AUTH REGISTER] Transaction validée avec succès.');

    res.status(201).json({
      success: true,
      message: 'Inscription réussie. Vous pouvez maintenant vous connecter.'
    });

  } catch (error) {
    await t.rollback();
    console.error('[AUTH REGISTER] ERREUR - Transaction annulée :', error);
    
    // Gérer les erreurs de contrainte unique
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors.map(err => err.path);
      if (fields.includes('email')) {
        return res.status(409).json({ success: false, message: 'Un utilisateur avec cet email existe déjà.' });
      }
      if (fields.includes('telephone')) {
        return res.status(409).json({ success: false, message: 'Un utilisateur avec ce numéro de téléphone existe déjà.' });
      }
    }
    
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription.' });
  }
};
exports.profile = (req, res) => {
  // Le middleware `protect` a déjà vérifié le token et attaché l'utilisateur à `req.user`.
  // Nous renvoyons simplement les données de l'User.
  res.status(200).json({
    success: true,
    data: {
      user: req.user, // req.user est fourni par le middleware `protect`
    },
  });
};

/**
 * @desc    Vérifier l'existence d'un champ (email ou téléphone)
 * @route   POST /api/v1/auth/check-existence
 * @access  Public
 */
exports.checkExistence = async (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({ success: false, message: 'Le champ et la valeur sont requis pour la vérification.' });
  }

  if (field !== 'email' && field !== 'telephone') {
    return res.status(400).json({ success: false, message: 'La vérification est uniquement supportée pour les champs "email" et "telephone".' });
  }

  try {
    let query = {
      where: {}
    };

    if (field === 'telephone') {
      // Utiliser une fonction SQL pour supprimer les espaces avant la comparaison
      query.where = sequelize.where(
        sequelize.fn('REPLACE', sequelize.col('telephone'), ' ', ''),
        sequelize.fn('REPLACE', value, ' ', '')
      );
    } else {
      query.where[field] = value;
    }

    const existingUser = await Utilisateurs.findOne(query);

    res.status(200).json({ success: true, exists: !!existingUser });

  } catch (error) {
    console.error(`Erreur lors de la vérification du champ ${field}:`, error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la vérification.' });
  }
};