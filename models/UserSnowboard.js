const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const UserSnowboard = sequelize.define('UserSnowboards', {
  // Define model attributes
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  snowboardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Snowboards',
      key: 'id'
    }
  },
});

module.exports = UserSnowboard;