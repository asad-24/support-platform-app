const env = require('../../core/util/functions/env');
const SERVER_CONFIG = require('./server');
const MIDDLEWARE_CONFIG = require('./middleware');
const DB_CONFIG = require('./db');
const MAIL_CONFIG = require('./mail');

const APP_CONFIG = {
  debug: env.bool('DEBUG', false),
  server: SERVER_CONFIG,
  middleware: MIDDLEWARE_CONFIG,
  db: DB_CONFIG,
  mail: MAIL_CONFIG,
};

module.exports = APP_CONFIG;
