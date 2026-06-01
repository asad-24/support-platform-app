'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class School extends Model {
  static init() {
    return super.init(
      {
        submittedByUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'submitted_by_user_id' },
        approvedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'approved_by_user_id' },
        uniqueSiteId: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'unique_site_id' },
        schoolName: { type: DataTypes.STRING, allowNull: true, field: 'school_name' },
        localName: { type: DataTypes.STRING, allowNull: true, field: 'local_name' },
        schoolType: { type: DataTypes.STRING, allowNull: true, field: 'school_type' },
        operatorName: { type: DataTypes.STRING, allowNull: true, field: 'operator_name' },
        phone: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'draft' },
        urgency: { type: DataTypes.STRING, allowNull: true },
        needs: { type: DataTypes.JSON, allowNull: true },
        correctionIssues: { type: DataTypes.JSON, allowNull: true, field: 'correction_issues' },
        adminFeedback: { type: DataTypes.TEXT, allowNull: true, field: 'admin_feedback' },
        submittedAt: { type: DataTypes.DATE, allowNull: true, field: 'submitted_at' },
        reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
        archivedAt: { type: DataTypes.DATE, allowNull: true, field: 'archived_at' },
        archivedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'archived_by_user_id' },
      },
      { sequelize, tableName: 'schools', modelName: 'School' }
    );
  }
}

School.init();
debug('model: defined School');

module.exports = School;
