'use strict';

module.exports = async () => {
  // Close Mongo-backed queue processors
  try {
    const ox = require('../core/instances/oxen');
    if (ox && typeof ox.closeAll === 'function') {
      await ox.closeAll();
    }
  } catch (_) {}

  // Close MongoDB connection
  try {
    const core = require('../core/util/classes/Model');
    if (core && core.sequelize && typeof core.sequelize.close === 'function') {
      await core.sequelize.close();
    }
  } catch (_) {}
};
