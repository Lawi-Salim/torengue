module.exports = (sequelize, DataTypes) => {
  const Vendeurs = sequelize.define('Vendeurs', {
  id_vendeur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_boutique: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nationalite: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  statut: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Vendeurs',
  timestamps: false
});

  Vendeurs.associate = (models) => {
    Vendeurs.belongsTo(models.Utilisateurs, { foreignKey: 'id_user', as: 'user' });
    Vendeurs.hasMany(models.Produits, { foreignKey: 'id_vendeur', as: 'produits' });
    Vendeurs.hasMany(models.Commandes, { foreignKey: 'id_vendeur', as: 'commandes' });
    Vendeurs.hasMany(models.Ventes, { foreignKey: 'id_vendeur', as: 'ventes' });
    Vendeurs.belongsToMany(models.Clients, { 
      through: models.ClientVendeurs, 
      foreignKey: 'id_vendeur',
      otherKey: 'id_client',
      as: 'clientsFavoris'
    });
  };

  return Vendeurs;
}; 