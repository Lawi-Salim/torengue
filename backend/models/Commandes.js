module.exports = (sequelize, DataTypes) => {
  const Commandes = sequelize.define('Commandes', {
  id_commande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_client: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Clients',
      key: 'id_client'
    }
  },
  date_commande: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statut: {
    type: DataTypes.ENUM('en attente', 'payée', 'validée', 'en préparation', 'expédiée', 'livrée', 'annulée'),
    defaultValue: 'en attente'
  },
  nbr_article: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  id_vendeur: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Vendeurs',
      key: 'id_vendeur'
    }
  }
}, {
  tableName: 'Commandes',
  timestamps: false
});

Commandes.associate = (models) => {
  Commandes.hasMany(models.DetailCommandes, {
    foreignKey: 'id_commande',
    as: 'details'
  });

  Commandes.belongsTo(models.Clients, {
    foreignKey: 'id_client',
    as: 'client'
  });

  Commandes.belongsTo(models.Vendeurs, {
    foreignKey: 'id_vendeur',
    as: 'vendeur'
  });
};

  return Commandes;
};
