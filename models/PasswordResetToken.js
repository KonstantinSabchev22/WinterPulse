const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  updatedAt: false, // No need to track updates
});

module.exports = PasswordResetToken;