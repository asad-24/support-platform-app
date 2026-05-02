'use strict';

const { hashPassword, normalizeEmail } = require('../../services/auth/credentials');

function adminDefaults() {
  return {
    name: String(process.env.ADMIN_NAME || 'System Admin').trim(),
    email: normalizeEmail(process.env.ADMIN_EMAIL || 'admin@schoolsupportatlas.local'),
    password: String(process.env.ADMIN_PASSWORD || 'admin123'),
  };
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const defaults = adminDefaults();
    const { salt, hash } = hashPassword(defaults.password);

    await queryInterface.bulkDelete('users', { email: defaults.email }, {});
    await queryInterface.bulkInsert('users', [
      {
        name: defaults.name,
        email: defaults.email,
        username: null,
        role: 'admin',
        password_salt: salt,
        password_hash: hash,
        access_token: null,
        access_token_created_at: null,
        refresh_token: null,
        refresh_token_created_at: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    const defaults = adminDefaults();
    await queryInterface.bulkDelete('users', { email: defaults.email }, {});
  },
};
