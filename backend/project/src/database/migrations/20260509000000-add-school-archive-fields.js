'use strict';

async function addColumn(queryInterface, table, column, definition) {
  await queryInterface.addColumn(table, column, definition);
}

async function removeColumn(queryInterface, table, column) {
  await queryInterface.removeColumn(table, column);
}

/** MongoDB migration */
module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumn(queryInterface, 'schools', 'archived_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await addColumn(queryInterface, 'schools', 'archived_by_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('schools', ['archived_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('schools', ['archived_at']);
    await removeColumn(queryInterface, 'schools', 'archived_by_user_id');
    await removeColumn(queryInterface, 'schools', 'archived_at');
  },
};
