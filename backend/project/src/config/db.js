const env = require('../../core/util/functions/env');

const DB_CONFIG = {
  host: env('DB_HOST', '127.0.0.1'),
  port: env.int('DB_PORT', 3306),
  username: env('DB_USER', 'root'),
  password: env('DB_PASS', ''),
  database: env('DB_NAME', 'expressjs_api_server'),
  dialect: env('DB_DIALECT', 'mysql'),
  logging: env.bool('DB_LOGGING', false),
};

const url = env('DATABASE_URL', null);
if (url) DB_CONFIG.url = url;

const storage = env('DB_STORAGE', null);
if (storage) DB_CONFIG.storage = storage;

module.exports = DB_CONFIG;
