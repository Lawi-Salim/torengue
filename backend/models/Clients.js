module.exports = (sequelize, DataTypes) => {
  const Clients = sequelize.define('Clients', {
  id_client: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adresse_facturation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  solde: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 250000.00
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Clients',
  timestamps: false
});

  Clients.associate = (models) => {
    Clients.belongsTo(models.Utilisateurs, { foreignKey: 'id_user', as: 'user' });
    Clients.hasMany(models.Commandes, { foreignKey: 'id_client', as: 'commandes' });
    Clients.hasMany(models.Ventes, { foreignKey: 'id_client', as: 'ventes' });
  };

  return Clients;
}; 