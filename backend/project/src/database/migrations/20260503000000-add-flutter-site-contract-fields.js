'use strict';

async function addColumn(queryInterface, table, column, definition) {
  await queryInterface.addColumn(table, column, definition);
}

async function removeColumn(queryInterface, table, column) {
  await queryInterface.removeColumn(table, column);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumn(queryInterface, 'schools', 'unique_site_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addIndex('schools', ['unique_site_id'], {
      unique: true,
      name: 'schools_unique_site_id_unique',
    });
    await addColumn(queryInterface, 'schools', 'local_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'schools', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'schools', 'needs', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await addColumn(queryInterface, 'schools', 'correction_issues', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await addColumn(queryInterface, 'school_locations', 'ward', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_locations', 'landmark', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumn(queryInterface, 'school_children_stats', 'age_0_to_5', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_children_stats', 'age_6_to_9', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_children_stats', 'age_10_to_14', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_children_stats', 'age_15_plus', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_children_stats', 'age_groups', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_children_stats', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    const welfareColumns = {
      feeding_status: Sequelize.STRING,
      shelter_status: Sequelize.STRING,
      sanitation_status: Sequelize.STRING,
      water_access: Sequelize.STRING,
      health_access: Sequelize.STRING,
      clothing_status: Sequelize.STRING,
      meals_per_day: Sequelize.INTEGER,
      water_source: Sequelize.STRING,
      has_toilet_access: Sequelize.BOOLEAN,
      has_adequate_clothing: Sequelize.BOOLEAN,
      has_healthcare_access: Sequelize.BOOLEAN,
      sleeping_arrangement: Sequelize.STRING,
      hygiene_condition: Sequelize.STRING,
      safety_risks: Sequelize.TEXT,
      urgency_reason: Sequelize.TEXT,
      follow_up_date: Sequelize.DATE,
      notes: Sequelize.TEXT,
    };
    for (const [column, type] of Object.entries(welfareColumns)) {
      await addColumn(queryInterface, 'school_welfare_assessments', column, {
        type,
        allowNull: true,
      });
    }
    await addColumn(queryInterface, 'school_welfare_assessments', 'immediate_intervention_needed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addColumn(queryInterface, 'school_photos', 'client_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_photos', 'local_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_photos', 'captured_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_photos', 'latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
    await addColumn(queryInterface, 'school_photos', 'longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    for (const column of ['longitude', 'latitude', 'captured_at', 'local_path', 'client_id']) {
      await removeColumn(queryInterface, 'school_photos', column);
    }

    for (const column of [
      'immediate_intervention_needed',
      'notes',
      'follow_up_date',
      'urgency_reason',
      'safety_risks',
      'hygiene_condition',
      'sleeping_arrangement',
      'has_healthcare_access',
      'has_adequate_clothing',
      'has_toilet_access',
      'water_source',
      'meals_per_day',
      'clothing_status',
      'health_access',
      'water_access',
      'sanitation_status',
      'shelter_status',
      'feeding_status',
    ]) {
      await removeColumn(queryInterface, 'school_welfare_assessments', column);
    }

    for (const column of ['notes', 'age_groups', 'age_15_plus', 'age_10_to_14', 'age_6_to_9', 'age_0_to_5']) {
      await removeColumn(queryInterface, 'school_children_stats', column);
    }

    for (const column of ['landmark', 'ward']) {
      await removeColumn(queryInterface, 'school_locations', column);
    }

    await queryInterface.removeIndex('schools', 'schools_unique_site_id_unique');
    for (const column of ['correction_issues', 'needs', 'phone', 'local_name', 'unique_site_id']) {
      await removeColumn(queryInterface, 'schools', column);
    }
  },
};
