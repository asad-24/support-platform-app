'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class VolunteerApplication extends Model {
  static init() {
    return super.init(
      {
        requestId: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'request_id' },
        fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
        email: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false, field: 'date_of_birth' },
        gender: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        lga: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.TEXT, allowNull: false },
        educationLevel: { type: DataTypes.STRING, allowNull: false, field: 'education_level' },
        occupation: { type: DataTypes.STRING, allowNull: false },
        skills: { type: DataTypes.TEXT, allowNull: false },
        volunteerExperience: { type: DataTypes.TEXT, allowNull: false, field: 'volunteer_experience' },
        availability: { type: DataTypes.STRING, allowNull: false },
        volunteeringMode: { type: DataTypes.STRING, allowNull: false, field: 'volunteering_mode' },
        motivation: { type: DataTypes.TEXT, allowNull: false },
        emergencyContactName: { type: DataTypes.STRING, allowNull: false, field: 'emergency_contact_name' },
        emergencyContactPhone: { type: DataTypes.STRING, allowNull: false, field: 'emergency_contact_phone' },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
        reviewedByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'reviewed_by_user_id' },
        reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
        adminNotes: { type: DataTypes.TEXT, allowNull: true, field: 'admin_notes' },
      },
      { sequelize, tableName: 'volunteer_applications', modelName: 'VolunteerApplication' }
    );
  }
}

VolunteerApplication.init();
debug('model: defined VolunteerApplication');

module.exports = VolunteerApplication;
