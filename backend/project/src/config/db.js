const env = require('../../core/util/functions/env');

const DB_CONFIG = {
  uri: env('MONGODB_URI', 'mongodb://127.0.0.1:27017'),
  database: env('MONGODB_DB_NAME', 'support_platform_app'),
  testDatabase: env('MONGODB_TEST_DB_NAME', 'support_platform_app_test'),
  dialect: 'mongodb',
  logging: env.bool('DB_LOGGING', false),
};

const url = env('DATABASE_URL', null);
if (url) DB_CONFIG.url = url;

module.exports = DB_CONFIG;
