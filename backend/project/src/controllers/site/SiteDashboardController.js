'use strict';

const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');

class SiteDashboardController {
  async summary(req, res) {
    return res.json(await FlutterSchoolStore.dashboardSummary());
  }
}

module.exports = new SiteDashboardController();
