module.exports = (sequelize, DataTypes) => {
  const Categories = sequelize.define('Categories', {
  id_categorie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'Categories',
  timestamps: false
});

  Categories.associate = (models) => {
    Categories.hasMany(models.Produits, { foreignKey: 'id_categorie', as: 'produits' });
  };

  return Categories;
}; 