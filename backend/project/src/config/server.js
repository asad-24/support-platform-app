const env = require('../../core/util/functions/env');

const SERVER_CONFIG = {
  protocol: env('SERVER_PROTOCOL', 'http'),
  host: env('SERVER_HOST', '127.0.0.1'),
  port: env('SERVER_PORT', 8000),
  publicUrl: env('SERVER_PUBLIC_URL', null),
  corsOrigins: env('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000'),
};

module.exports = SERVER_CONFIG;
