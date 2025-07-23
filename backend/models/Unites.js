module.exports = (sequelize, DataTypes) => {
  const Unites = sequelize.define('Unites', {
  id_unite: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  symbole: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'Unites',
  timestamps: false
});

  Unites.associate = (models) => {
    Unites.hasMany(models.Produits, { foreignKey: 'id_unite', as: 'produits' });
  };

  return Unites;
}; 