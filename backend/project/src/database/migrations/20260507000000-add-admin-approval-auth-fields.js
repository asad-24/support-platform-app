'use strict';

async function addColumn(queryInterface, table, column, definition) {
  await queryInterface.addColumn(table, column, definition);
}

async function removeColumn(queryInterface, table, column) {
  await queryInterface.removeColumn(table, column);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumn(queryInterface, 'users', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active',
    });
    await queryInterface.addIndex('users', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', ['status']).catch(() => null);
    await removeColumn(queryInterface, 'users', 'status');
  },
};
