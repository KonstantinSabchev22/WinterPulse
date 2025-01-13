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

UserSnowboard.associate = (models) => {
  UserSnowboard.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
  UserSnowboard.belongsTo(models.SnowBoards, { foreignKey: 'snowboardId', as: 'snowboard' });
};


module.exports = UserSnowboard;