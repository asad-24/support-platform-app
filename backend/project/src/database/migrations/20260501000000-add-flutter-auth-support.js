'use strict';

function idColumn(Sequelize) {
  return {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  };
}

function timestamps(Sequelize) {
  return {
    createdAt: { allowNull: false, type: Sequelize.DATE },
    updatedAt: { allowNull: false, type: Sequelize.DATE },
  };
}

function userRef(Sequelize, allowNull = false) {
  return {
    type: Sequelize.INTEGER,
    allowNull,
    references: { model: 'users', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: allowNull ? 'SET NULL' : 'CASCADE',
  };
}

async function addColumn(queryInterface, table, column, definition) {
  await queryInterface.addColumn(table, column, definition);
}

async function removeColumn(queryInterface, table, column) {
  await queryInterface.removeColumn(table, column);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumn(queryInterface, 'users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_unique',
    });
    await addColumn(queryInterface, 'users', 'refresh_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex('users', ['refresh_token'], {
      unique: true,
      name: 'users_refresh_token_unique',
    });
    await addColumn(queryInterface, 'users', 'refresh_token_created_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    const profileColumns = {
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      gender: { type: Sequelize.STRING, allowNull: true },
      education_level: { type: Sequelize.STRING, allowNull: true },
      occupation: { type: Sequelize.STRING, allowNull: true },
      skills: { type: Sequelize.TEXT, allowNull: true },
      volunteer_experience: { type: Sequelize.TEXT, allowNull: true },
      availability: { type: Sequelize.STRING, allowNull: true },
      volunteering_mode: { type: Sequelize.STRING, allowNull: true },
      motivation: { type: Sequelize.TEXT, allowNull: true },
      emergency_contact_name: { type: Sequelize.STRING, allowNull: true },
      emergency_contact_phone: { type: Sequelize.STRING, allowNull: true },
    };
    for (const [column, definition] of Object.entries(profileColumns)) {
      await addColumn(queryInterface, 'volunteer_profiles', column, definition);
    }

    await queryInterface.createTable('volunteer_applications', {
      id: idColumn(Sequelize),
      request_id: { type: Sequelize.STRING, allowNull: false, unique: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
      gender: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      lga: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: false },
      education_level: { type: Sequelize.STRING, allowNull: false },
      occupation: { type: Sequelize.STRING, allowNull: false },
      skills: { type: Sequelize.TEXT, allowNull: false },
      volunteer_experience: { type: Sequelize.TEXT, allowNull: false },
      availability: { type: Sequelize.STRING, allowNull: false },
      volunteering_mode: { type: Sequelize.STRING, allowNull: false },
      motivation: { type: Sequelize.TEXT, allowNull: false },
      emergency_contact_name: { type: Sequelize.STRING, allowNull: false },
      emergency_contact_phone: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      reviewed_by_user_id: userRef(Sequelize, true),
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      admin_notes: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps(Sequelize),
    });
    await queryInterface.addIndex('volunteer_applications', ['email']);
    await queryInterface.addIndex('volunteer_applications', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('volunteer_applications');

    const profileColumns = [
      'emergency_contact_phone',
      'emergency_contact_name',
      'motivation',
      'volunteering_mode',
      'availability',
      'volunteer_experience',
      'skills',
      'occupation',
      'education_level',
      'gender',
      'date_of_birth',
    ];
    for (const column of profileColumns) {
      await removeColumn(queryInterface, 'volunteer_profiles', column);
    }

    await queryInterface.removeIndex('users', 'users_refresh_token_unique');
    await queryInterface.removeIndex('users', 'users_username_unique');
    await removeColumn(queryInterface, 'users', 'refresh_token_created_at');
    await removeColumn(queryInterface, 'users', 'refresh_token');
    await removeColumn(queryInterface, 'users', 'username');
  },
};
