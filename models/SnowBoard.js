const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const OrderItem = require('./OrderItem'); // Import OrderItem model

const SnowBoard = sequelize.define('SnowBoards', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  length: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Define the reverse association
SnowBoard.associate = (models) => {
  SnowBoard.hasMany(models.OrderItem, { foreignKey: 'snowboardId', as: 'orderItems' });
};

module.exports = SnowBoard;
