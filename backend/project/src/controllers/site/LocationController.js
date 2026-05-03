'use strict';

const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');

class LocationController {
  async nigeria_states_lgas(req, res) {
    return res.json(await FlutterSchoolStore.nigeriaStatesAndLgas());
  }
}

module.exports = new LocationController();
