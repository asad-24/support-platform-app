'use strict';

/** MongoDB migration */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oxen_queue', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      batch_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
      },
      job_type: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      created_ts: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      started_ts: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      body: {
        type: Sequelize.STRING(10000),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'waiting',
      },
      result: {
        type: Sequelize.TEXT('medium'),
        allowNull: true,
      },
      recovered: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      running_time: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: true,
      },
      unique_key: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        unique: true,
      },
      priority: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('oxen_queue', ['created_ts']);
    await queryInterface.addIndex('oxen_queue', ['status']);
    await queryInterface.addIndex('oxen_queue', ['job_type', 'batch_id', 'status', 'priority'], { name: 'locking_update' });
    await queryInterface.addIndex('oxen_queue', ['batch_id', 'priority'], { name: 'next_jobs_select' });
    await queryInterface.addIndex('oxen_queue', ['started_ts', 'job_type', 'status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('oxen_queue');
  },
};
