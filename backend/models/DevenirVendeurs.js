module.exports = (sequelize, DataTypes) => {
  const DevenirVendeurs = sequelize.define('DevenirVendeurs', {
  id_devenirvendeur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  id_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Utilisateurs',
      key: 'id_user'
    }
  },
  nom_boutique: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email_pro: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nationalite: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'valide', 'rejete'),
    defaultValue: 'en_attente'
  },
  motif_rejet: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_demande: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  traite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'DevenirVendeurs',
  timestamps: false
});

  DevenirVendeurs.associate = (models) => {
    DevenirVendeurs.belongsTo(models.Utilisateurs, { foreignKey: 'id_user', as: 'user' });
  };

  return DevenirVendeurs;
};
