module.exports = (sequelize, DataTypes) => {
  const ClientVendeurs = sequelize.define('ClientVendeurs', {
  id_client: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Clients',
      key: 'id_client'
    }
  },
  id_vendeur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Vendeurs',
      key: 'id_vendeur'
    }
  }
}, {
  tableName: 'ClientVendeurs',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_client', 'id_vendeur']
    }
  ]
});

  ClientVendeurs.associate = (models) => {
    ClientVendeurs.belongsTo(models.Clients, { foreignKey: 'id_client', as: 'client' });
    ClientVendeurs.belongsTo(models.Vendeurs, { foreignKey: 'id_vendeur', as: 'vendeur' });
  };

  return ClientVendeurs;
};
