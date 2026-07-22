const env = require('../../core/util/functions/env');

const SERVER_CONFIG = {
  protocol: env('SERVER_PROTOCOL', 'http'),
  host: env('SERVER_HOST', '127.0.0.1'),
  port: env('SERVER_PORT', 8000),
  publicUrl: env('SERVER_PUBLIC_URL', null),
  corsOrigins: env(
    'CORS_ORIGINS',
    [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
      'https://schoolsupportatlas.com',
      'https://www.schoolsupportatlas.com',
      'https://admin.schoolsupportatlas.com',
    ].join(',')
  ),
};

module.exports = SERVER_CONFIG;
