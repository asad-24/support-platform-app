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

function schoolRef(Sequelize, allowNull = false) {
  return {
    type: Sequelize.INTEGER,
    allowNull,
    references: { model: 'schools', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: allowNull ? 'SET NULL' : 'CASCADE',
  };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('volunteer_notifications', {
      id: idColumn(Sequelize),
      recipient_user_id: userRef(Sequelize),
      actor_user_id: userRef(Sequelize, true),
      school_id: schoolRef(Sequelize, true),
      type: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'unread' },
      read_at: { type: Sequelize.DATE, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.addIndex('volunteer_notifications', ['recipient_user_id', 'status']);
    await queryInterface.addIndex('volunteer_notifications', ['recipient_user_id', 'createdAt']);
    await queryInterface.addIndex('volunteer_notifications', ['school_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('volunteer_notifications');
  },
};
