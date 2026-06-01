'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class VolunteerProfile extends Model {
  static init() {
    return super.init(
      {
        userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
        fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
        phone: { type: DataTypes.STRING, allowNull: false },
        profilePhotoUrl: { type: DataTypes.STRING, allowNull: true, field: 'profile_photo_url' },
        state: { type: DataTypes.STRING, allowNull: false },
        lga: { type: DataTypes.STRING, allowNull: false },
        ward: { type: DataTypes.STRING, allowNull: true },
        community: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: false },
        bio: { type: DataTypes.TEXT, allowNull: true },
        dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true, field: 'date_of_birth' },
        gender: { type: DataTypes.STRING, allowNull: true },
        educationLevel: { type: DataTypes.STRING, allowNull: true, field: 'education_level' },
        occupation: { type: DataTypes.STRING, allowNull: true },
        skills: { type: DataTypes.TEXT, allowNull: true },
        volunteerExperience: { type: DataTypes.TEXT, allowNull: true, field: 'volunteer_experience' },
        availability: { type: DataTypes.STRING, allowNull: true },
        volunteeringMode: { type: DataTypes.STRING, allowNull: true, field: 'volunteering_mode' },
        motivation: { type: DataTypes.TEXT, allowNull: true },
        emergencyContactName: { type: DataTypes.STRING, allowNull: true, field: 'emergency_contact_name' },
        emergencyContactPhone: { type: DataTypes.STRING, allowNull: true, field: 'emergency_contact_phone' },
        isCompleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_completed' },
        completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
      },
      { sequelize, tableName: 'volunteer_profiles', modelName: 'VolunteerProfile' }
    );
  }
}

VolunteerProfile.init();
debug('model: defined VolunteerProfile');

module.exports = VolunteerProfile;
