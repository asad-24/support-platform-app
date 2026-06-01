'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolView extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
        userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
        viewedAt: { type: DataTypes.DATE, allowNull: false, field: 'viewed_at' },
      },
      { sequelize, tableName: 'school_views', modelName: 'SchoolView', timestamps: false }
    );
  }
}

SchoolView.init();
debug('model: defined SchoolView');

module.exports = SchoolView;
