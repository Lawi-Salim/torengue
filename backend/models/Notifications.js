module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
  id_notif: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notif_lu: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  type_notif: {
    type: DataTypes.ENUM('alert', 'info', 'confirmation', 'demande_vendeur', 'approbation_vendeur', 'rejet_vendeur', 'new_order', 'payment_received', 'new_product'),
    allowNull: false,
    defaultValue: 'info'
  },
  date_notif: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Utilisateurs', // Référence au nom du modèle
      key: 'id_user'
    }
  }
}, {
  tableName: 'Notifications',
  timestamps: false
});

  Notifications.associate = (models) => {
    Notifications.belongsTo(models.Utilisateurs, { foreignKey: 'id_user', as: 'user' });
  };

  return Notifications;
};
