'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolPhoto extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, field: 'school_id' },
        uploadedByUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'uploaded_by_user_id' },
        fileUrl: { type: DataTypes.STRING, allowNull: false, field: 'file_url' },
        category: { type: DataTypes.STRING, allowNull: false },
        caption: { type: DataTypes.STRING, allowNull: true },
      },
      { sequelize, tableName: 'school_photos', modelName: 'SchoolPhoto' }
    );
  }
}

SchoolPhoto.init();
debug('model: defined SchoolPhoto');

module.exports = SchoolPhoto;
