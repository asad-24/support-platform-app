'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolLocation extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'school_id' },
        latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
        country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Nigeria' },
        state: { type: DataTypes.STRING, allowNull: true },
        lga: { type: DataTypes.STRING, allowNull: true },
        ward: { type: DataTypes.STRING, allowNull: true },
        community: { type: DataTypes.STRING, allowNull: true },
        landmark: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'school_locations', modelName: 'SchoolLocation' }
    );
  }
}

SchoolLocation.init();
debug('model: defined SchoolLocation');

module.exports = SchoolLocation;
