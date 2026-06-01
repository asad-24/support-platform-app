'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class VolunteerNotification extends Model {
  static init() {
    return super.init(
      {
        recipientUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'recipient_user_id' },
        actorUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'actor_user_id' },
        schoolId: { type: DataTypes.INTEGER, allowNull: true, field: 'school_id' },
        type: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'unread' },
        readAt: { type: DataTypes.DATE, allowNull: true, field: 'read_at' },
        metadata: { type: DataTypes.JSON, allowNull: true },
      },
      { sequelize, tableName: 'volunteer_notifications', modelName: 'VolunteerNotification' }
    );
  }
}

VolunteerNotification.init();
debug('model: defined VolunteerNotification');

module.exports = VolunteerNotification;
