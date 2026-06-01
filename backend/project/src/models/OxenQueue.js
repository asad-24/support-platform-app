'use strict';
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class OxenQueue extends Model {
  static init() {
    return super.init(
      {
        batch_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        job_type: { type: DataTypes.STRING(200), allowNull: false },
        created_ts: { type: DataTypes.DATE, allowNull: true },
        started_ts: { type: DataTypes.DATE, allowNull: true },
        body: { type: DataTypes.STRING(10000), allowNull: true },
        status: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'waiting' },
        result: { type: DataTypes.TEXT('medium'), allowNull: true },
        recovered: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
        running_time: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
        unique_key: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, unique: true },
        priority: { type: DataTypes.BIGINT, allowNull: true },
      },
      {
        sequelize,
        tableName: 'oxen_queue',
        modelName: 'OxenQueue',
        timestamps: false,
      }
    );
  }
}

OxenQueue.init();

module.exports = OxenQueue;
