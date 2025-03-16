const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('Users', {
  // Define model attributes
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING
    // allowNull defaults to true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email'], // Explicitly defines the email index
      name: 'unique_email_index' // Ensures consistency and prevents duplication
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

User.associate = (models) => {
  User.hasMany(models.PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' });
  User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
};

module.exports = User;