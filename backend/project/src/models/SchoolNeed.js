'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolNeed extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
        submittedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'submitted_by_user_id' },
        originalNeedId: { type: DataTypes.STRING, allowNull: true, field: 'original_need_id' },
        title: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        urgency: { type: DataTypes.STRING, allowNull: true },
        estimatedCost: { type: DataTypes.DECIMAL, allowNull: true, field: 'estimated_cost' },
        quantityRequired: { type: DataTypes.INTEGER, allowNull: true, field: 'quantity_required' },
        quantityFunded: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: 'quantity_funded' },
        images: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
        pausedAt: { type: DataTypes.DATE, allowNull: true, field: 'paused_at' },
        pausedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'paused_by_user_id' },
        deletedAt: { type: DataTypes.DATE, allowNull: true, field: 'deleted_at' },
        deletedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'deleted_by_user_id' },
      },
      { sequelize, tableName: 'school_needs', modelName: 'SchoolNeed' }
    );
  }
}

SchoolNeed.init();
debug('model: defined SchoolNeed');

module.exports = SchoolNeed;
