'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class School extends Model {
  static init() {
    return super.init(
      {
        submittedByUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'submitted_by_user_id' },
        approvedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'approved_by_user_id' },
        schoolName: { type: DataTypes.STRING, allowNull: true, field: 'school_name' },
        schoolType: { type: DataTypes.STRING, allowNull: true, field: 'school_type' },
        operatorName: { type: DataTypes.STRING, allowNull: true, field: 'operator_name' },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'draft' },
        urgency: { type: DataTypes.STRING, allowNull: true },
        adminFeedback: { type: DataTypes.TEXT, allowNull: true, field: 'admin_feedback' },
        submittedAt: { type: DataTypes.DATE, allowNull: true, field: 'submitted_at' },
        reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
      },
      { sequelize, tableName: 'schools', modelName: 'School' }
    );
  }
}

School.init();
debug('model: defined School');

module.exports = School;
