module.exports = (sequelize, DataTypes) => {
  const DetailVentes = sequelize.define('DetailVentes', {
    id_detail_vente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_vente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ventes',
        key: 'id_vente'
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
    quantite_vendue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prix_unitaire: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'DetailVentes',
    timestamps: false
  });

  DetailVentes.associate = (models) => {
    DetailVentes.belongsTo(models.Ventes, { foreignKey: 'id_vente', as: 'vente' });
    DetailVentes.belongsTo(models.Produits, { foreignKey: 'id_produit', as: 'produit' });
  };

  return DetailVentes;
};
