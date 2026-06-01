'use strict';

const ProfileStore = require('@src/services/VolunteerProfileStore');
const SchoolStore = require('@src/services/SchoolStore');

class VolunteerDashboardController {
  async index(req, res) {
    const profileStatus = await ProfileStore.getStatus(req.auth.user.id);
    const stats = await SchoolStore.dashboardStatsForVolunteer(req.auth.user.id);

    return res.json({
      success: true,
      data: {
        volunteer: {
          ...req.auth.user,
          profile: profileStatus.profile,
          profile_photo_url: profileStatus.profile && profileStatus.profile.profile_photo_url,
        },
        stats,
      },
    });
  }
}

module.exports = new VolunteerDashboardController();
