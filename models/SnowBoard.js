const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const SnowBoard = sequelize.define('SnowBoards',{

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    length: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    material: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
    

});

module.exports = SnowBoard;