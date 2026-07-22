const env = require('../../core/util/functions/env');

const MAIL_CONFIG = {
  transport: env('EMAIL_TRANSPORT', 'smtp'),
  adminNotificationEmail: env('ADMIN_NOTIFICATION_EMAIL', 'contact@schoolsupportatlas.com'),
  from: env(
    'BREVO_FROM',
    env('MAIL_FROM', 'School Support Atlas <info@schoolsupportatlas.com>')
  ),
  smtp: {
    host: env('BREVO_SMTP_HOST', null),
    port: env.int('BREVO_SMTP_PORT', 587),
    secure: env.bool('BREVO_SMTP_SECURE', false),
    user: env('BREVO_SMTP_USER', null),
    pass: env('BREVO_SMTP_KEY', null),
  },
};

module.exports = MAIL_CONFIG;
