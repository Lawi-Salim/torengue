const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Utilisateurs = sequelize.define('Utilisateurs', {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_user'
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'vendeur', 'client'),
      allowNull: false,
      defaultValue: 'admin'
    },
    date_inscription: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'date_inscription'
    }
  }, {
    tableName: 'Utilisateurs',
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });

  Utilisateurs.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  Utilisateurs.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  Utilisateurs.associate = (models) => {
    Utilisateurs.hasOne(models.Vendeurs, { foreignKey: 'id_user', as: 'vendeur' });
    Utilisateurs.hasOne(models.Clients, { foreignKey: 'id_user', as: 'client' });
    Utilisateurs.hasMany(models.Notifications, { foreignKey: 'id_user', as: 'notifications' });
    Utilisateurs.hasMany(models.DevenirVendeurs, { foreignKey: 'id_user', as: 'demandesVendeur' });
  };

  return Utilisateurs;
}; 