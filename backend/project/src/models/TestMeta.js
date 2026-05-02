'use strict';
const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class TestMeta extends Model {
  static init() {
    return super.init(
      {
        key: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING, allowNull: false },
      },
      { sequelize, tableName: 'test_metas', modelName: 'TestMeta' }
    );
  }
}

TestMeta.init();
debug('model: defined TestMeta');

module.exports = TestMeta;
