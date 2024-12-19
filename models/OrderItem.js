const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const SnowBoard = require('./SnowBoard'); // Import SnowBoard model

const OrderItem = sequelize.define('OrderItem', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders', // Reference to the Orders table
      key: 'id',
    },
  },
  snowboardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'SnowBoards', // Reference to the SnowBoards table
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Define the association
OrderItem.associate = (models) => {
  OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  OrderItem.belongsTo(models.SnowBoards, { foreignKey: 'snowboardId', as: 'snowboard' });
};



module.exports = OrderItem;
