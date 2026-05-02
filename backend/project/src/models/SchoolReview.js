'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolReview extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
        reviewedByUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'reviewed_by_user_id' },
        status: { type: DataTypes.STRING, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, tableName: 'school_reviews', modelName: 'SchoolReview' }
    );
  }
}

SchoolReview.init();
debug('model: defined SchoolReview');

module.exports = SchoolReview;
