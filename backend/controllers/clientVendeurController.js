const { ClientVendeurs, Clients, Vendeurs, Utilisateurs } = require('../models');

// @desc    Ajouter un vendeur aux favoris d'un client
// @route   POST /api/v1/client-vendeurs
// @access  Private/Client
exports.addVendeurToFavoris = async (req, res) => {
  try {
    console.log('=== AJOUT VENDEUR AUX FAVORIS ===');
    console.log('Body:', req.body);
    const { id_vendeur } = req.body;
    const id_user = req.user.id_user;
    console.log('ID Vendeur:', id_vendeur);
    console.log('ID User:', id_user);

    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Seuls les clients peuvent ajouter des vendeurs aux favoris.' 
      });
    }

    // Récupérer l'ID du client
    const client = await Clients.findOne({ where: { id_user } });
    console.log('Client trouvé:', client);
    if (!client) {
      console.log('❌ Client non trouvé pour user ID:', id_user);
      return res.status(404).json({ 
        success: false, 
        message: 'Profil client non trouvé.' 
      });
    }

    // Vérifier que le vendeur existe
    const vendeur = await Vendeurs.findByPk(id_vendeur);
    if (!vendeur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendeur non trouvé.' 
      });
    }

    // Vérifier si la relation existe déjà
    const existingRelation = await ClientVendeurs.findOne({
      where: { 
        id_client: client.id_client, 
        id_vendeur: id_vendeur 
      }
    });

    if (existingRelation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce vendeur est déjà dans vos favoris.' 
      });
    }

    // Créer la relation
    await ClientVendeurs.create({
      id_client: client.id_client,
      id_vendeur: id_vendeur
    });

    res.status(201).json({ 
      success: true, 
      message: 'Vendeur ajouté aux favoris avec succès.' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du vendeur aux favoris:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur.' 
    });
  }
};

// @desc    Récupérer les vendeurs favoris d'un client
// @route   GET /api/v1/client-vendeurs
// @access  Private/Client
exports.getVendeursFavoris = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Seuls les clients peuvent voir leurs vendeurs favoris.' 
      });
    }

    // Récupérer l'ID du client
    const client = await Clients.findOne({ where: { id_user } });
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profil client non trouvé.' 
      });
    }

    // Récupérer les vendeurs favoris avec leurs détails
    const vendeursFavoris = await ClientVendeurs.findAll({
      where: { id_client: client.id_client },
      include: [{
        model: Vendeurs,
        as: 'vendeur',
        include: [{
          model: Utilisateurs,
          as: 'user',
          attributes: ['nom', 'email', 'telephone']
        }]
      }]
    });

    res.status(200).json({ 
      success: true, 
      data: vendeursFavoris 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des vendeurs favoris:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur.' 
    });
  }
};

// @desc    Supprimer un vendeur des favoris d'un client
// @route   DELETE /api/v1/client-vendeurs/:id_vendeur
// @access  Private/Client
exports.removeVendeurFromFavoris = async (req, res) => {
  try {
    const { id_vendeur } = req.params;
    const id_user = req.user.id_user;

    // Vérifier que l'utilisateur est un client
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Seuls les clients peuvent supprimer des vendeurs de leurs favoris.' 
      });
    }

    // Récupérer l'ID du client
    const client = await Clients.findOne({ where: { id_user } });
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profil client non trouvé.' 
      });
    }

    // Supprimer la relation
    const deletedCount = await ClientVendeurs.destroy({
      where: { 
        id_client: client.id_client, 
        id_vendeur: id_vendeur 
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ce vendeur n\'est pas dans vos favoris.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Vendeur supprimé des favoris avec succès.' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du vendeur des favoris:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur.' 
    });
  }
}; 