'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SponsorRequest extends Model {
  static init() {
    return super.init(
      {
        requestId: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'request_id' },
        sponsorName: { type: DataTypes.STRING, allowNull: false, field: 'sponsor_name' },
        sponsorEmail: { type: DataTypes.STRING, allowNull: false, field: 'sponsor_email' },
        sponsorPhone: { type: DataTypes.STRING, allowNull: false, field: 'sponsor_phone' },
        sponsorCountry: { type: DataTypes.STRING, allowNull: false, field: 'sponsor_country' },
        organizationName: { type: DataTypes.STRING, allowNull: true, field: 'organization_name' },
        preferredHelpType: { type: DataTypes.STRING, allowNull: false, field: 'preferred_help_type' },
        pledgeAmount: { type: DataTypes.DECIMAL, allowNull: true, field: 'pledge_amount' },
        helpDetails: { type: DataTypes.TEXT, allowNull: false, field: 'help_details' },
        message: { type: DataTypes.TEXT, allowNull: false },
        schoolId: { type: DataTypes.STRING, allowNull: false, field: 'school_id' },
        schoolName: { type: DataTypes.STRING, allowNull: false, field: 'school_name' },
        selectedNeeds: { type: DataTypes.JSON, allowNull: false, field: 'selected_needs', defaultValue: [] },
        profileLink: { type: DataTypes.STRING, allowNull: true, field: 'profile_link' },
        status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'new' },
      },
      { sequelize, tableName: 'sponsor_requests', modelName: 'SponsorRequest' }
    );
  }
}

SponsorRequest.init();
debug('model: defined SponsorRequest');

module.exports = SponsorRequest;
