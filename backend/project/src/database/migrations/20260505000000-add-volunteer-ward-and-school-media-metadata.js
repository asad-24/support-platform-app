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
    await addColumn(queryInterface, 'volunteer_profiles', 'ward', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumn(queryInterface, 'school_photos', 'media_kind', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'image',
    });
    await addColumn(queryInterface, 'school_photos', 'mime_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_photos', 'size', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    for (const column of ['size', 'mime_type', 'media_kind']) {
      await removeColumn(queryInterface, 'school_photos', column);
    }
    await removeColumn(queryInterface, 'volunteer_profiles', 'ward');
  },
};
