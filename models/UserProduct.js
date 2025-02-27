const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const UserProduct = sequelize.define('UserProduct', {
  // Define model attributes
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
});

UserProduct.associate = (models) => {
  UserProduct.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
  UserProduct.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
};


module.exports = UserProduct;