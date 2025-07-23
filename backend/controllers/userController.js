const { Utilisateurs, Vendeurs, Clients } = require('../models');
const { Op } = require('sequelize');

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Récupère tous les utilisateurs en excluant le hash du mot de passe
    const users = await Utilisateurs.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    // La réponse doit être formatée pour correspondre à la structure attendue par le frontend
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Récupérer tous les utilisateurs avec les détails du vendeur
 * @route   GET /api/users/details
 * @access  Private/Admin
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
