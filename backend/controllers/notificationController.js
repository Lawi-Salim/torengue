const { Notifications, Utilisateurs } = require('../models');

exports.getAllNotifications = async (req, res) => {
  try {
    // Récupérer uniquement les notifications pour l'utilisateur connecté
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    
    const notifications = await Notifications.findAll({
      where: { id_user: req.user.id_user },
      order: [['date_notif', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).send('Erreur serveur');
  }
};

exports.getNotificationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id_user !== parseInt(userId, 10) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    const notifications = await Notifications.findAll({
      where: { id_user: userId },
      order: [['date_notif', 'DESC']],
    });

    res.json(notifications);
  } catch (error) {
    console.error(`Erreur lors de la récupération des notifications pour l'utilisateur ${req.params.userId}:`, error);
    res.status(500).send('Erreur serveur');
  }
};

exports.createNotification = async (id_user, type_notif, message, url = null) => {
  try {
    await Notifications.create({ id_user, type_notif, message, url });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    // Ne pas bloquer le flux principal si la notification échoue
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notifications.findByPk(id);
    if (notification) {
      notification.notif_lu = true;
      await notification.save();
      res.status(200).json({ message: 'Notification marquée comme lue.' });
    } else {
      res.status(404).send('Notification non trouvée');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).send('Erreur serveur');
  }
};
