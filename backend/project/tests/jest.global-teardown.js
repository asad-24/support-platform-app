'use strict';

module.exports = async () => {
  // Close oxen-queue MySQL pools and stop any processors
  try {
    const ox = require('../core/instances/oxen');
    if (ox && typeof ox.closeAll === 'function') {
      await ox.closeAll();
    }
  } catch (_) {}

  // Close Sequelize connection
  try {
    const core = require('../core/util/classes/Model');
    if (core && core.sequelize && typeof core.sequelize.close === 'function') {
      await core.sequelize.close();
    }
  } catch (_) {}
};

