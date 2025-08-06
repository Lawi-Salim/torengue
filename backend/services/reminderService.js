const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require('../models');

/**
 * Vérifie les commandes non livrées et envoie des rappels aux vendeurs concernés.
 */
const checkOrdersAndSendReminders = async () => {
  console.log('Exécution de la tâche de vérification des rappels de commande...');

  try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours

    console.log(`Recherche des commandes non livrées créées il y a plus de 7 jours...`);
    // 1. Trouver les commandes non livrées créées il y a plus de 24h
    const overdueOrders = await db.Commandes.findAll({
      where: {
        statut: { [Op.ne]: 'livrée' },
                date_commande: { [Op.lte]: sevenDaysAgo },
      },
      include: [
        {
          model: db.Vendeurs,
          as: 'vendeur',
          required: true,
          include: [
            { 
              model: db.Utilisateurs,
              as: 'user',
              required: true,
              where: {
                rappels_actives: true,
              },
            },
          ],
        },
      ]
    });

    console.log(`Recherche des commandes non livrées terminée. Résultat : ${overdueOrders.length} commande(s) trouvée(s).`);

    if (overdueOrders.length === 0) {
      console.log('Aucune commande en retard nécessitant un rappel.');
      return;
    }

    console.log(`${overdueOrders.length} commande(s) en retard trouvée(s).`);

    // Définir les créneaux horaires une seule fois en dehors de la boucle
    const timeSlot = {
            matin: { start: 6, end: 8 },
      soir: { start: 18, end: 20 },
      nuit: { start: 22, end: 23 },
    };

    // 2. Traiter chaque commande et envoyer une notification si nécessaire
    for (const order of overdueOrders) {
      const vendorUser = order.vendeur.user;
      const now = new Date();
      const currentHour = now.getHours();

      console.log(`--- Traitement commande #${order.id_commande} pour vendeur ID ${vendorUser.id_user} ---`);
      console.log(`Préférences vendeur: Actif=${vendorUser.rappels_actives}, Horaire=${vendorUser.rappel_horaire}`);

      const preferredSlot = timeSlot[vendorUser.rappel_horaire];
      console.log(`Heure actuelle: ${currentHour}. Créneau choisi: ${vendorUser.rappel_horaire} (${preferredSlot.start}h-${preferredSlot.end}h).`);

      if (preferredSlot && currentHour >= preferredSlot.start && currentHour <= preferredSlot.end) {
        console.log('OK: Le vendeur est dans son créneau horaire.');
        // Vérifier si un rappel pour cette commande a déjà été envoyé
        const existingReminder = await db.Notifications.findOne({
            where: {
                id_commande: order.id_commande,
                type_notif: 'rappel_commande'
            }
        });

        if (!existingReminder) {
            console.log('OK: Aucun rappel existant. Création du rappel...');
            await db.Notifications.create({
                id_user: vendorUser.id_user,
                id_commande: order.id_commande,
                message: `Rappel : La commande #${order.id_commande} passée le ${order.date_commande.toLocaleDateString()} n'a toujours pas été marquée comme livrée.`,
                type_notif: 'rappel_commande',
            });
            console.log(`✅ Rappel envoyé au vendeur ${vendorUser.id_user} pour la commande ${order.id_commande}.`);
        } else {
            console.log('SKIP: Un rappel pour cette commande a déjà été envoyé.');
        }
      } else {
        console.log('SKIP: Le vendeur n\'est pas dans son créneau horaire.');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des rappels de commande:', error);
  }
};

/**
 * Démarre la tâche planifiée pour les rappels de commande.
 * La tâche s'exécute toutes les heures.
 */
const startReminderService = () => {
  // Toutes les heures, à la minute 0
    // Exécution toutes les 5 minutes pour le test
      // Exécution tous les jours à 8h du matin
  cron.schedule('0 8 * * *', checkOrdersAndSendReminders);
      console.log('Service de rappel de commande démarré. Vérification quotidienne à 8h.');
};

module.exports = { startReminderService };
