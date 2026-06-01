const env = require('../../core/util/functions/env');

const MAIL_CONFIG = {
  transport: env('EMAIL_TRANSPORT', 'smtp'),
  from: env('SMTP_FROM', env('MAIL_FROM', 'Support Atlas <no-reply@schoolsupportatlas.local>')),
  smtp: {
    host: env('SMTP_HOST', null),
    port: env.int('SMTP_PORT', 587),
    secure: env.bool('SMTP_SECURE', false),
    user: env('SMTP_USER', null),
    pass: env('SMTP_PASS', null),
  },
};

module.exports = MAIL_CONFIG;
