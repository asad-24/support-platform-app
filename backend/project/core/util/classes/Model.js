'use strict';

const MongoDB = require('./MongoDB');
const { MongoModel, DataTypes } = require('./MongoModel');

module.exports = {
  sequelize: MongoDB.default,
  mongo: MongoDB.default,
  MongoDB,
  DataTypes,
  Model: MongoModel,
};
