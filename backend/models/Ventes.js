module.exports = (sequelize, DataTypes) => {
  const Ventes = sequelize.define('Ventes', {
  id_vente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_commande: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Commandes',
      key: 'id_commande'
    }
  },
  id_client: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id_client'
    }
  },
  id_vendeur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vendeurs',
      key: 'id_vendeur'
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  montant_total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  etat_vente: {
    type: DataTypes.ENUM('en cours', 'livrée', 'annulée'),
    allowNull: false,
    defaultValue: 'en cours'
  }
}, {
  tableName: 'Ventes',
  timestamps: false
});

  Ventes.associate = (models) => {
    Ventes.belongsTo(models.Commandes, { foreignKey: 'id_commande', as: 'commande' });
    Ventes.belongsTo(models.Clients, { foreignKey: 'id_client', as: 'client' });
    Ventes.belongsTo(models.Vendeurs, { foreignKey: 'id_vendeur', as: 'vendeur' });
    Ventes.hasMany(models.DetailVentes, { foreignKey: 'id_vente', as: 'details' });
    Ventes.hasOne(models.Factures, { foreignKey: 'id_vente', as: 'facture' });
    Ventes.hasOne(models.Livraisons, { foreignKey: 'id_vente', as: 'livraison' });
  };

  return Ventes;
};
