const db = require('../models');
const { Utilisateurs, Vendeurs, Clients, sequelize } = db;

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateurs.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Récupérer le profil utilisateur
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const user = await Utilisateurs.findByPk(id_user, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    let profileData = { ...user.toJSON() };

    if (user.role === 'client') {
      const client = await Clients.findOne({ where: { id_user } });
      if (client) {
        profileData.clientDetails = client.toJSON();
      }
    } else if (user.role === 'vendeur') {
      const vendeur = await Vendeurs.findOne({ where: { id_user } });
      if (vendeur) {
        profileData.vendeurDetails = vendeur.toJSON();
      }
    }

    res.status(200).json({ success: true, data: profileData });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Mettre à jour le profil de l'utilisateur
 * @route   PUT /api/v1/users/me/profile
 * @access  Private
 */
exports.getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await Utilisateurs.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Vendeurs,
          as: 'vendeur',
          required: false,
        },
        {
          model: Clients,
          as: 'client',
          required: false,
        },
      ],
      where: {
        [Op.or]: [
          { role: 'client' },
          {
            [Op.and]: [
              { role: 'vendeur' },
              { '$vendeur.statut$': { [Op.ne]: 'pending' } }
            ]
          }
        ]
      },
      order: [['date_inscription', 'DESC']],
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.updateProfile = async (req, res) => {
  const id_user = req.user.id_user;
  const { email, current_password, ...otherData } = req.body;

  const t = await sequelize.transaction();

  try {
    const user = await Utilisateurs.findByPk(id_user, { transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (email && email !== user.email) {
      if (!current_password) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Le mot de passe actuel est requis pour changer l\'adresse e-mail.' });
      }

      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Le mot de passe actuel est incorrect.' });
      }

      const existingUserWithNewEmail = await Utilisateurs.findOne({ where: { email }, transaction: t });
      if (existingUserWithNewEmail) {
        await t.rollback();
        return res.status(409).json({ success: false, message: 'Cette adresse e-mail est déjà utilisée.' });
      }

      user.email = email;
    }

    user.nom = otherData.nom ?? user.nom;
    user.telephone = otherData.telephone ?? user.telephone;

    // Mettre à jour les préférences de rappel si elles sont fournies
    if (typeof otherData.rappels_actives === 'boolean') {
      user.rappels_actives = otherData.rappels_actives;
    }
    if (otherData.rappel_horaire) {
      user.rappel_horaire = otherData.rappel_horaire;
    }

    await user.save({ transaction: t });

    if (user.role === 'vendeur') {
      const vendeurUpdateData = {};
      if (otherData.nom_boutique !== undefined) {
        vendeurUpdateData.nom_boutique = otherData.nom_boutique;
      }
      if (otherData.adresse !== undefined) {
        vendeurUpdateData.adresse = otherData.adresse;
      }

      if (Object.keys(vendeurUpdateData).length > 0) {
        await Vendeurs.update(vendeurUpdateData, { where: { id_user }, transaction: t });
      }
    } else if (user.role === 'client') {
      const clientUpdateData = {};
      if (otherData.adresse !== undefined) {
        clientUpdateData.adresse_facturation = otherData.adresse;
      }

      if (Object.keys(clientUpdateData).length > 0) {
        await Clients.update(clientUpdateData, { where: { id_user }, transaction: t });
      }
    }

    await t.commit();

    const updatedUser = await Utilisateurs.findByPk(id_user, { attributes: { exclude: ['password_hash'] } });
    res.status(200).json({ success: true, message: 'Profil mis à jour avec succès', data: updatedUser.toJSON() });

  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour.' });
  }
};

/**
 * @desc    Récupérer les utilisateurs récents
 * @route   GET /api/v1/users/recent
 * @access  Private (admin)
 */
exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await Utilisateurs.findAll({
      limit: 7,
      order: [['date_inscription', 'DESC']],
      attributes: ['nom', 'email', 'role', 'date_inscription']
    });
    res.status(200).json({ success: true, data: recentUsers });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs récents:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Récupérer les vendeurs en attente d'approbation
 * @route   GET /api/v1/users/pending-sellers
 * @access  Private/Admin
 */
exports.getPendingSellers = async (req, res, next) => {
  try {
    // On cherche dans la table Vendeurs, pas Utilisateurs
    const pendingSellers = await Vendeurs.findAll({
      where: {
        statut: 'pending' // Le statut est dans la table Vendeurs
      },
      include: {
        model: Utilisateurs,
        as: 'user',
        attributes: ['id_user', 'nom', 'email', 'date_inscription'] // On récupère les infos de l'utilisateur associé
      },
      attributes: ['id_vendeur', 'nom_boutique', 'created_at'] // On récupère les infos du vendeur
    });

    // On formate la réponse pour correspondre à ce que le front attend
    const formattedData = pendingSellers.map(vendeur => ({
        id_user: vendeur.user.id_user,
        nom: vendeur.user.nom,
        email: vendeur.user.email,
        date_creation: vendeur.user.date_inscription, // On renvoie date_inscription comme date_creation
        nom_boutique: vendeur.nom_boutique,
        id_vendeur: vendeur.id_vendeur
    }));

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des vendeurs en attente:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};