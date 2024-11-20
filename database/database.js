// database.js
const { Sequelize } = require('sequelize');
const config = require('./config.json'); // Note the change in path

const environment = process.env.NODE_ENV || 'development';
const { username, password, database, host, dialect } = config[environment];

const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect
});


module.exports = sequelize;