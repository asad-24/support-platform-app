'use strict';

const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');

class SiteExportController {
  async sites(req, res) {
    return res.json(await FlutterSchoolStore.exportSites());
  }
}

module.exports = new SiteExportController();
