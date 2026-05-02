'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class VolunteerActivityLog extends Model {
  static init() {
    return super.init(
      {
        userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
        schoolId: { type: DataTypes.INTEGER, allowNull: true, field: 'school_id' },
        action: { type: DataTypes.STRING, allowNull: false },
        metadata: { type: DataTypes.JSON, allowNull: true },
      },
      { sequelize, tableName: 'volunteer_activity_logs', modelName: 'VolunteerActivityLog' }
    );
  }
}

VolunteerActivityLog.init();
debug('model: defined VolunteerActivityLog');

module.exports = VolunteerActivityLog;
