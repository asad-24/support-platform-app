'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolOperator extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
        name: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: true },
      },
      { sequelize, tableName: 'school_operators', modelName: 'SchoolOperator' }
    );
  }
}

SchoolOperator.init();
debug('model: defined SchoolOperator');

module.exports = SchoolOperator;
