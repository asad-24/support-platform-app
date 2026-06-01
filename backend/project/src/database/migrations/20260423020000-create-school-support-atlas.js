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

/** MongoDB migration */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('volunteer_profiles', {
      id: idColumn(Sequelize),
      user_id: { ...userRef(Sequelize), unique: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: false },
      profile_photo_url: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: false },
      lga: { type: Sequelize.STRING, allowNull: false },
      community: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: false },
      bio: { type: Sequelize.TEXT, allowNull: true },
      is_completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('schools', {
      id: idColumn(Sequelize),
      submitted_by_user_id: userRef(Sequelize),
      approved_by_user_id: userRef(Sequelize, true),
      school_name: { type: Sequelize.STRING, allowNull: true },
      school_type: { type: Sequelize.STRING, allowNull: true },
      operator_name: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'draft' },
      urgency: { type: Sequelize.STRING, allowNull: true },
      admin_feedback: { type: Sequelize.TEXT, allowNull: true },
      submitted_at: { type: Sequelize.DATE, allowNull: true },
      reviewed_at: { type: Sequelize.DATE, allowNull: true },
      ...timestamps(Sequelize),
    });
    await queryInterface.addIndex('schools', ['submitted_by_user_id']);
    await queryInterface.addIndex('schools', ['status']);

    await queryInterface.createTable('school_operators', {
      id: idColumn(Sequelize),
      school_id: schoolRef(Sequelize),
      name: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_locations', {
      id: idColumn(Sequelize),
      school_id: { ...schoolRef(Sequelize), unique: true },
      latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      country: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Nigeria' },
      state: { type: Sequelize.STRING, allowNull: true },
      lga: { type: Sequelize.STRING, allowNull: true },
      community: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_photos', {
      id: idColumn(Sequelize),
      school_id: schoolRef(Sequelize),
      uploaded_by_user_id: userRef(Sequelize),
      file_url: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      caption: { type: Sequelize.STRING, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_children_stats', {
      id: idColumn(Sequelize),
      school_id: { ...schoolRef(Sequelize), unique: true },
      total_children: { type: Sequelize.INTEGER, allowNull: true },
      residential_children: { type: Sequelize.INTEGER, allowNull: true },
      non_residential_children: { type: Sequelize.INTEGER, allowNull: true },
      boys_count: { type: Sequelize.INTEGER, allowNull: true },
      girls_count: { type: Sequelize.INTEGER, allowNull: true },
      age_3_5_count: { type: Sequelize.INTEGER, allowNull: true },
      age_6_10_count: { type: Sequelize.INTEGER, allowNull: true },
      age_11_15_count: { type: Sequelize.INTEGER, allowNull: true },
      age_16_18_count: { type: Sequelize.INTEGER, allowNull: true },
      age_18_plus_count: { type: Sequelize.INTEGER, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_welfare_assessments', {
      id: idColumn(Sequelize),
      school_id: { ...schoolRef(Sequelize), unique: true },
      has_clean_water: { type: Sequelize.BOOLEAN, allowNull: true },
      has_sanitation: { type: Sequelize.BOOLEAN, allowNull: true },
      has_healthcare: { type: Sequelize.BOOLEAN, allowNull: true },
      has_nutritious_food: { type: Sequelize.BOOLEAN, allowNull: true },
      has_educational_materials: { type: Sequelize.BOOLEAN, allowNull: true },
      has_recreational_facilities: { type: Sequelize.BOOLEAN, allowNull: true },
      has_clothing_shelter: { type: Sequelize.BOOLEAN, allowNull: true },
      has_sleeping_area: { type: Sequelize.BOOLEAN, allowNull: true },
      has_electricity: { type: Sequelize.BOOLEAN, allowNull: true },
      has_internet: { type: Sequelize.BOOLEAN, allowNull: true },
      has_transportation: { type: Sequelize.BOOLEAN, allowNull: true },
      has_financial_resources: { type: Sequelize.BOOLEAN, allowNull: true },
      safety_physical_abuse: { type: Sequelize.BOOLEAN, allowNull: true },
      safety_child_labor: { type: Sequelize.BOOLEAN, allowNull: true },
      safety_sexual_abuse: { type: Sequelize.BOOLEAN, allowNull: true },
      safety_trafficking: { type: Sequelize.BOOLEAN, allowNull: true },
      additional_notes: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_reviews', {
      id: idColumn(Sequelize),
      school_id: schoolRef(Sequelize),
      reviewed_by_user_id: userRef(Sequelize),
      status: { type: Sequelize.STRING, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('school_views', {
      id: idColumn(Sequelize),
      school_id: schoolRef(Sequelize),
      user_id: userRef(Sequelize),
      viewed_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('school_views', ['school_id', 'user_id', 'viewed_at']);

    await queryInterface.createTable('volunteer_activity_logs', {
      id: idColumn(Sequelize),
      user_id: userRef(Sequelize),
      school_id: schoolRef(Sequelize, true),
      action: { type: Sequelize.STRING, allowNull: false },
      metadata: { type: Sequelize.JSON, allowNull: true },
      ...timestamps(Sequelize),
    });

    await queryInterface.createTable('admin_notifications', {
      id: idColumn(Sequelize),
      actor_user_id: userRef(Sequelize),
      school_id: schoolRef(Sequelize, true),
      type: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'unread' },
      read_at: { type: Sequelize.DATE, allowNull: true },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      ...timestamps(Sequelize),
    });
    await queryInterface.addIndex('admin_notifications', ['status']);
    await queryInterface.addIndex('admin_notifications', ['type', 'createdAt']);
    await queryInterface.addIndex('admin_notifications', ['school_id']);

  },

  async down(queryInterface) {
    const tables = [
      'admin_notifications',
      'volunteer_activity_logs',
      'school_views',
      'school_reviews',
      'school_welfare_assessments',
      'school_children_stats',
      'school_photos',
      'school_locations',
      'school_operators',
      'schools',
      'volunteer_profiles',
    ];

    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  },
};
