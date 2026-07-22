'use strict';

const MongoDB = require('@core/util/classes/MongoDB');

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNeed(need, school) {
  if (typeof need === 'string') {
    const title = readString(need);
    if (!title) return null;
    return {
      schoolId: school.id,
      submittedByUserId: school.submittedByUserId || null,
      originalNeedId: title,
      title,
      category: null,
      description: null,
      urgency: school.urgency || null,
      estimatedCost: null,
      quantityRequired: null,
      quantityFunded: 0,
      images: [],
      status: 'active',
      pausedAt: null,
      pausedByUserId: null,
      deletedAt: null,
      deletedByUserId: null,
    };
  }

  if (!need || typeof need !== 'object') return null;
  const title = readString(need.title) || readString(need.name) || readString(need.id);
  if (!title) return null;
  const status = readString(need.status).toLowerCase();

  return {
    schoolId: school.id,
    submittedByUserId: school.submittedByUserId || null,
    originalNeedId: readString(need.id) || title,
    title,
    category: readString(need.category) || null,
    description: readString(need.description) || null,
    urgency: readString(need.urgency) || school.urgency || null,
    estimatedCost: need.estimatedCost === undefined || need.estimatedCost === null || need.estimatedCost === ''
      ? null
      : Number(need.estimatedCost),
    quantityRequired: need.quantityRequired === undefined || need.quantityRequired === null || need.quantityRequired === ''
      ? null
      : Number(need.quantityRequired),
    quantityFunded: Number(need.quantityFunded) || 0,
    images: Array.isArray(need.images) ? need.images : [],
    status: status === 'paused' || status === 'deleted' ? status : 'active',
    pausedAt: null,
    pausedByUserId: null,
    deletedAt: null,
    deletedByUserId: null,
  };
}

/** MongoDB migration */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('school_needs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      school_id: { type: Sequelize.INTEGER, allowNull: false },
      submitted_by_user_id: { type: Sequelize.INTEGER, allowNull: true },
      original_need_id: { type: Sequelize.STRING, allowNull: true },
      title: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      urgency: { type: Sequelize.STRING, allowNull: true },
      estimated_cost: { type: Sequelize.DECIMAL, allowNull: true },
      quantity_required: { type: Sequelize.INTEGER, allowNull: true },
      quantity_funded: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
      images: { type: Sequelize.JSON, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      paused_at: { type: Sequelize.DATE, allowNull: true },
      paused_by_user_id: { type: Sequelize.INTEGER, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      deleted_by_user_id: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('school_needs', ['school_id']);
    await queryInterface.addIndex('school_needs', ['status']);
    await queryInterface.addIndex('school_needs', ['deleted_at']);

    const schools = await queryInterface.db.collection('schools').find({ needs: { $exists: true, $ne: [] } }).toArray();
    const now = new Date();
    const rows = [];
    for (const school of schools) {
      const needs = Array.isArray(school.needs) ? school.needs : [];
      for (const need of needs) {
        const row = normalizeNeed(need, school);
        if (!row) continue;
        row.id = await MongoDB.default.nextId('school_needs');
        row.createdAt = now;
        row.updatedAt = now;
        rows.push(row);
      }
    }
    if (rows.length) {
      await queryInterface.db.collection('school_needs').insertMany(rows, { ordered: false }).catch((error) => {
        if (error && error.code !== 11000) throw error;
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('school_needs');
  },
};
