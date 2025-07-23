module.exports = (sequelize, DataTypes) => {
  const Paiements = sequelize.define('Paiements', {
  id_paiement: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_paiement: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  montant_paye: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  mode_paiement: {
    type: DataTypes.ENUM('carte', 'virement', 'espèces'),
    defaultValue: 'espèces'
  },
  id_facture: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Factures',
      key: 'id_facture'
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
  tableName: 'Paiements',
  timestamps: false
});

  Paiements.associate = (models) => {
    Paiements.belongsTo(models.Factures, { foreignKey: 'id_facture', as: 'facture' });
    Paiements.belongsTo(models.Commandes, { foreignKey: 'id_commande', as: 'commande' });
  };

  return Paiements;
};
