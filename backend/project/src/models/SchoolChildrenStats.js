'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolChildrenStats extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'school_id' },
        totalChildren: { type: DataTypes.INTEGER, allowNull: true, field: 'total_children' },
        residentialChildren: { type: DataTypes.INTEGER, allowNull: true, field: 'residential_children' },
        nonResidentialChildren: { type: DataTypes.INTEGER, allowNull: true, field: 'non_residential_children' },
        boysCount: { type: DataTypes.INTEGER, allowNull: true, field: 'boys_count' },
        girlsCount: { type: DataTypes.INTEGER, allowNull: true, field: 'girls_count' },
        age35Count: { type: DataTypes.INTEGER, allowNull: true, field: 'age_3_5_count' },
        age610Count: { type: DataTypes.INTEGER, allowNull: true, field: 'age_6_10_count' },
        age1115Count: { type: DataTypes.INTEGER, allowNull: true, field: 'age_11_15_count' },
        age1618Count: { type: DataTypes.INTEGER, allowNull: true, field: 'age_16_18_count' },
        age18PlusCount: { type: DataTypes.INTEGER, allowNull: true, field: 'age_18_plus_count' },
      },
      { sequelize, tableName: 'school_children_stats', modelName: 'SchoolChildrenStats' }
    );
  }
}

SchoolChildrenStats.init();
debug('model: defined SchoolChildrenStats');

module.exports = SchoolChildrenStats;
