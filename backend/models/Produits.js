module.exports = (sequelize, DataTypes) => {
  const Produits = sequelize.define('Produits', {
  id_produit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  stock_actuel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  image: {
    type: DataTypes.STRING(255),
    defaultValue: 'default.jpg'
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_categorie: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_unite: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_vendeur: {
    type: DataTypes.INTEGER,
    allowNull: false // Obligatoire car seuls les vendeurs créent des produits
  },
  seuil_alerte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    validate: {
      min: 0
    }
  },
  seuil_critique: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 0
    }
  },
  date_maj_stock: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Produits',
  timestamps: false,
  hooks: {
    beforeUpdate: (produit) => {
      if (produit.changed('stock_actuel')) {
        produit.date_maj_stock = new Date();
      }
    }
  }
});

// Méthode pour vérifier si le stock est faible
Produits.prototype.isStockLow = function() {
  return this.stock_actuel <= this.seuil_alerte;
};

// Méthode pour vérifier si le stock est critique
Produits.prototype.isStockCritical = function() {
  return this.stock_actuel <= this.seuil_critique;
};

// Méthode pour mettre à jour le stock
Produits.prototype.updateStock = async function(quantite, operation = 'add') {
  if (operation === 'add') {
    this.stock_actuel += quantite;
  } else if (operation === 'subtract') {
    this.stock_actuel = Math.max(0, this.stock_actuel - quantite);
  }
  this.date_maj_stock = new Date();
  return await this.save();
};

  Produits.associate = (models) => {
    Produits.belongsTo(models.Categories, { foreignKey: 'id_categorie', as: 'categorie' });
    Produits.belongsTo(models.Unites, { foreignKey: 'id_unite', as: 'unite' });
    Produits.belongsTo(models.Vendeurs, { foreignKey: 'id_vendeur', as: 'vendeur' });
    Produits.hasMany(models.DetailVentes, { foreignKey: 'id_produit', as: 'details_ventes' });
    Produits.hasMany(models.DetailCommandes, { foreignKey: 'id_produit' });
  };

  return Produits;
};