const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../database/config.json');

const environment = process.env.NODE_ENV || 'development';
const { username, password, database, host, dialect } = config[environment];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect
});

// Load models
const models = {};
const modelsPath = path.join(__dirname, '.');

fs
  .readdirSync(modelsPath)
  .filter(file => file !== 'index.js') // Exclude index.js from being imported
  .forEach(file => {
    const modelPath = path.join(modelsPath, file);
    const model = require(modelPath); // This directly gives you the model
    models[model.name] = model; // Correctly use the model's name as the key
  });

// Associate models if needed
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Define associations between models
const { User, Places, UserPlaces } = models;

// Define associations between User and UserPlaces
//User.belongsToMany(Places, { through: UserPlaces, foreignKey: 'userId' });
//Places.belongsToMany(User, { through: UserPlaces, foreignKey: 'placeId' });

// Export models and sequelize instance
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;