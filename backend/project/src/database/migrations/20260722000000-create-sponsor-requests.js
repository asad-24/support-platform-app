'use strict';

/** MongoDB migration */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sponsor_requests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      request_id: { type: Sequelize.STRING, allowNull: false },
      sponsor_name: { type: Sequelize.STRING, allowNull: false },
      sponsor_email: { type: Sequelize.STRING, allowNull: false },
      sponsor_phone: { type: Sequelize.STRING, allowNull: false },
      sponsor_country: { type: Sequelize.STRING, allowNull: false },
      organization_name: { type: Sequelize.STRING, allowNull: true },
      preferred_help_type: { type: Sequelize.STRING, allowNull: false },
      pledge_amount: { type: Sequelize.DECIMAL, allowNull: true },
      help_details: { type: Sequelize.TEXT, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      school_id: { type: Sequelize.STRING, allowNull: false },
      school_name: { type: Sequelize.STRING, allowNull: false },
      selected_needs: { type: Sequelize.JSON, allowNull: false },
      profile_link: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'new' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('sponsor_requests', ['status']);
    await queryInterface.addIndex('sponsor_requests', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sponsor_requests');
  },
};
