const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Reference to the Users table
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending',
    comment: 'The status of the order',
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The address where the order will be delivered',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'The date and time the order was created',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'The date and time the order was last updated',
  },
});

Order.associate = (models) => {
  Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
  Order.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
};

module.exports = Order;
