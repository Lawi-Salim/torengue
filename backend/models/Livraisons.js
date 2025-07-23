module.exports = (sequelize, DataTypes) => {
  const Livraisons = sequelize.define('Livraisons', {
  id_livraison: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_livraison: {
    type: DataTypes.DATE
  },
  statut_livraison: {
    type: DataTypes.ENUM('en préparation', 'en cours', 'livrée'),
    defaultValue: 'en préparation'
  },
  adresse: {
    type: DataTypes.TEXT
  },
  id_vente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ventes',
      key: 'id_vente'
    }
  },
  id_commande: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Commandes',
      key: 'id_commande'
    }
  }
}, {
  tableName: 'Livraisons',
  timestamps: false // Correction : désactive les timestamps pour éviter l'erreur 'createdAt'
});

  Livraisons.associate = (models) => {
    Livraisons.belongsTo(models.Ventes, { foreignKey: 'id_vente', as: 'vente' });
    Livraisons.belongsTo(models.Commandes, { foreignKey: 'id_commande', as: 'commande' });
  };

  return Livraisons;
};
