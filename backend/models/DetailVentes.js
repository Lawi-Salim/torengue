module.exports = (sequelize, DataTypes) => {
  const DetailVentes = sequelize.define('DetailVentes', {
  id_vente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Ventes',
      key: 'id_vente'
    }
  },
  id_produit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Produits',
      key: 'id_produit'
    }
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantite_vendue: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'DetailVentes',
  timestamps: false
});

  DetailVentes.associate = (models) => {
    DetailVentes.belongsTo(models.Ventes, { foreignKey: 'id_vente' });
    DetailVentes.belongsTo(models.Produits, { foreignKey: 'id_produit', as: 'produit' });
  };

  return DetailVentes;
};
