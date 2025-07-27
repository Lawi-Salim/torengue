const { DevenirVendeurs, Utilisateurs, Vendeurs, sequelize } = require('../models');
const { createNotification } = require('./notificationController');
const bcrypt = require('bcryptjs');

// @desc    Créer une nouvelle demande pour devenir vendeur
// @route   POST /api/devenir-vendeur
// @access  Public
exports.createDemande = async (req, res) => {
  const { nom, email, mot_de_passe, telephone, nom_boutique, nationalite, description } = req.body;

  // Validation simple
  if (!nom || !email || !mot_de_passe || !nom_boutique) {
    return res.status(400).json({ success: false, message: 'Les champs nom, email, mot de passe et nom de la boutique sont requis.' });
  }

  try {
    // Étape 1: Créer UNIQUEMENT la demande dans la table temporaire
    const demande = await DevenirVendeurs.create({
      nom, // Le nom complet de la personne
      email_pro: email, // L'email qui servira pour le compte
      password: mot_de_passe, // On stocke le mot de passe brut temporairement pour la future création
      telephone,
      nom_boutique,
      nationalite,
      description,
      statut: 'en_attente' // Statut initial
    });

    // Étape 2: Notifier les administrateurs
    const admins = await Utilisateurs.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification(
        admin.id_user,
        'demande_vendeur',
        `Nouvelle demande de vendeur de ${nom_boutique}`,
        '/dashboard/admin/demandes-vendeurs'
      );
    }

    res.status(201).json({ success: true, message: 'Votre demande a été soumise avec succès et est en attente d\'approbation.', data: demande });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc    Récupérer toutes les demandes pour devenir vendeur
// @route   GET /api/devenir-vendeur
// @access  Private/Admin
exports.getAllDemandes = async (req, res) => {
  try {
    const demandes = await DevenirVendeurs.findAll({
      where: { statut: 'en_attente' }
    });
    res.status(200).json({ success: true, data: demandes });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc    Récupérer le nombre de demandes en attente
// @route   GET /api/devenir-vendeur/pending-count
// @access  Private/Admin
exports.getPendingDemandesCount = async (req, res) => {
  try {
    const count = await DevenirVendeurs.count({
      where: { statut: 'en_attente' }
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de demandes en attente:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc    Approuver une demande de vendeur
// @route   PUT /api/devenir-vendeur/:id/approve
// @access  Private/Admin
exports.approveDemande = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const demande = await DevenirVendeurs.findByPk(req.params.id);

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée.' });
    }

    // Étape 1: Chercher ou créer l'utilisateur
    let user = await Utilisateurs.findOne({ where: { email: demande.email_pro } });

    if (user) {
      // L'utilisateur existe, mettre à jour son rôle en 'vendeur'
      user.role = 'vendeur';
      await user.save({ transaction: t });
    } else {
      // L'utilisateur n'existe pas, le créer
      user = await Utilisateurs.create({
        nom: demande.nom,
        email: demande.email_pro,
        password_hash: demande.password, // On passe le mot de passe brut, le hook du modèle Utilisateurs va le hacher
        telephone: demande.telephone,
        role: 'vendeur'
      }, { transaction: t });
    }

    // Étape 2: Créer l'entrée Vendeur
    await Vendeurs.create({
      id_user: user.id_user,
      nom_boutique: demande.nom_boutique,
      nationalite: demande.nationalite,
      description: demande.description,
      statut: 'valide'
    }, { transaction: t });

    // Étape 3: La demande a été traitée, nous pouvons la supprimer de la table temporaire
    await demande.destroy({ transaction: t });

    await t.commit(); // Valider la transaction

    res.status(200).json({ success: true, message: 'Vendeur approuvé avec succès.' });
  } catch (error) {
    await t.rollback(); // Annuler la transaction en cas d'erreur
    console.error("Erreur lors de l'approbation de la demande:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// @desc    Rejeter une demande de vendeur
// @route   PUT /api/devenir-vendeur/:id/reject
// @access  Private/Admin
exports.rejectDemande = async (req, res) => {
  try {
    const demande = await DevenirVendeurs.findByPk(req.params.id);

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée.' });
    }

    // La demande est rejetée, on la supprime de la table temporaire
    await demande.destroy();

    // Optionnel: Notifier l'utilisateur du rejet

    res.status(200).json({ success: true, message: 'Demande rejetée et supprimée.' });
  } catch (error) {
    console.error('Erreur lors du rejet de la demande:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
