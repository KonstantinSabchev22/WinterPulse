const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Product = sequelize.define('Product', {
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
    allowNull: true,
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
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  category: {
    type: DataTypes.ENUM('snowboard', 'ski', 'shoes', 'hats'),
    allowNull: false,
    defaultValue: 'snowboard'
  },

}, {
  tableName: 'Products', // This will create the table 'Products' in your database
});

Product.associate = (models) => {
  Product.hasMany(models.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  Product.hasMany(models.UserProduct, { foreignKey: 'productId', as: 'userProducts' });
};

module.exports = Product;
