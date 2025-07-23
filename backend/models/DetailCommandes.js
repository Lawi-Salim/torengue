module.exports = (sequelize, DataTypes) => {
  const DetailCommandes = sequelize.define('DetailCommandes', {
  id_detail: {
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
  id_produit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Produits',
      key: 'id_produit'
    }
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'DetailCommandes',
  timestamps: false
});

DetailCommandes.associate = (models) => {
  DetailCommandes.belongsTo(models.Commandes, {
    foreignKey: 'id_commande'
  });
  DetailCommandes.belongsTo(models.Produits, {
    foreignKey: 'id_produit',
    as: 'produit'
  });
};

  return DetailCommandes;
};
