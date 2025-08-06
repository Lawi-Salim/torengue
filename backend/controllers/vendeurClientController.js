const { ClientVendeurs, Clients, Vendeurs, Utilisateurs } = require('../models');

// @desc    Récupérer les clients qui ont ajouté ce vendeur aux favoris
// @route   GET /api/v1/vendeur-clients
// @access  Private/Vendeur
exports.getClientsFavoris = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    // Vérifier que l'utilisateur est un vendeur
    if (req.user.role !== 'vendeur') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Seuls les vendeurs peuvent voir leurs clients favoris.' 
      });
    }

    // Récupérer l'ID du vendeur
    const vendeur = await Vendeurs.findOne({ where: { id_user } });
    if (!vendeur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profil vendeur non trouvé.' 
      });
    }

    // Récupérer les clients qui ont ajouté ce vendeur aux favoris
    const clientsFavoris = await ClientVendeurs.findAll({
      where: { id_vendeur: vendeur.id_vendeur },
      include: [{
        model: Clients,
        as: 'client',
        include: [{
          model: Utilisateurs,
          as: 'user',
          attributes: ['nom', 'email', 'telephone']
        }]
      }]
    });

    res.status(200).json({ 
      success: true, 
      data: clientsFavoris 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des clients favoris:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur.' 
    });
  }
}; 