'use strict';

const SchoolStore = require('@src/services/SchoolStore');

class AdminDashboardController {
  async index(req, res) {
    const stats = await SchoolStore.dashboardStatsForAdmin();
    const notifications = await SchoolStore.AdminNotification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    return res.json({
      success: true,
      data: {
        stats,
        recent_notifications: notifications.map(SchoolStore.serializeNotification),
      },
    });
  }
}

module.exports = new AdminDashboardController();
