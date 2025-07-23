const { Vendeur, User, Notification, sequelize } = require('../models');

// Helper function to update status and notify
const updateStatusAndNotify = async (vendeurId, newStatus) => {
  const t = await sequelize.transaction();
  try {
    const vendeur = await Vendeur.findByPk(vendeurId, { transaction: t });
    if (!vendeur) {
      throw new Error('Vendeur non trouvé');
    }

    vendeur.statut = newStatus;
    await vendeur.save({ transaction: t });

    const message = newStatus === 'valide'
      ? 'Félicitations ! Votre demande de vendeur a été approuvée.'
      : 'Votre demande de vendeur a été rejetée.';
    
    const type_notif = newStatus === 'valide'
      ? 'approbation_vendeur'
      : 'rejet_vendeur';

    await Notification.create({
      id_user: vendeur.id_user,
      message: message,
      type_notif: type_notif
    }, { transaction: t });

    await t.commit();
    return { success: true, data: vendeur };

  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// @desc    Get all pending sellers
// @route   GET /api/vendeurs/pending
// @access  Private/Admin
exports.getPendingVendeurs = async (req, res) => {
  try {
    const vendeurs = await Vendeur.findAll({
      where: { statut: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['nom', 'email'] }]
    });
    res.status(200).json({ success: true, data: vendeurs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// @desc    Approve a seller
// @route   PUT /api/vendeurs/:id/approve
// @access  Private/Admin
exports.approveVendeur = async (req, res) => {
  try {
    const result = await updateStatusAndNotify(req.params.id, 'valide');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};

// @desc    Reject a seller
// @route   PUT /api/vendeurs/:id/reject
// @access  Private/Admin
exports.rejectVendeur = async (req, res) => {
  try {
    const result = await updateStatusAndNotify(req.params.id, 'rejete');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
};
