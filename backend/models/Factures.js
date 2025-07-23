module.exports = (sequelize, DataTypes) => {
  const Factures = sequelize.define('Factures', {
  id_facture: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  montant_HT: {
    type: DataTypes.DECIMAL(10, 2)
  },
  montant_TTC: {
    type: DataTypes.DECIMAL(10, 2)
  },
  montant_total: {
    type: DataTypes.DECIMAL(10, 2)
  },
  statut_paiement: {
    type: DataTypes.ENUM('payé', 'en attente', 'annulé'),
    defaultValue: 'en attente'
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
  tableName: 'Factures',
  timestamps: false
});

  Factures.associate = (models) => {
    Factures.belongsTo(models.Ventes, { foreignKey: 'id_vente', as: 'vente' });
    Factures.belongsTo(models.Commandes, { foreignKey: 'id_commande', as: 'commande' });
    Factures.hasMany(models.Paiements, { foreignKey: 'id_facture', as: 'paiements' });
  };

  return Factures;
};
