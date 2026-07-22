'use strict';

const Op = require('@core/util/classes/Operators');
const SchoolNeed = require('@src/models/SchoolNeed');
const School = require('@src/models/School');
const SchoolLocation = require('@src/models/SchoolLocation');
const User = require('@src/models/User');
const { sanitizeUser } = require('@src/services/auth/credentials');

const STATUSES = new Set(['active', 'paused', 'deleted']);
const NEED_LABELS = {
  feeding: { title: 'Feeding support', category: 'Food' },
  clothing: { title: 'Clothing support', category: 'Clothing' },
  bedding: { title: 'Bedding and mats', category: 'Shelter' },
  shelterImprovement: { title: 'Shelter improvement', category: 'Shelter' },
  healthOutreach: { title: 'Health outreach', category: 'Healthcare' },
  counselling: { title: 'Counselling support', category: 'Welfare' },
  sanitation: { title: 'Sanitation support', category: 'Sanitation' },
  waterAccess: { title: 'Water access', category: 'Water' },
  hygieneKits: { title: 'Hygiene kits', category: 'Sanitation' },
  educationMaterials: { title: 'Education materials', category: 'Learning Materials' },
  safeguarding: { title: 'Safeguarding support', category: 'Safety' },
  identityDocumentation: { title: 'Identity documentation', category: 'Documentation' },
  other: { title: 'Other support', category: 'Other' },
};

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function needLabel(value) {
  const key = readString(value);
  if (NEED_LABELS[key]) return NEED_LABELS[key];
  return {
    title: key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || key,
    category: null,
  };
}

function normalizeNeed(need, school = {}) {
  if (typeof need === 'string') {
    const key = readString(need);
    if (!key) return null;
    const label = needLabel(key);
    return {
      schoolId: school.id,
      submittedByUserId: school.submittedByUserId || null,
      originalNeedId: key,
      title: label.title,
      category: label.category,
      description: null,
      urgency: school.urgency || null,
      estimatedCost: null,
      quantityRequired: null,
      quantityFunded: 0,
      images: [],
      status: 'active',
    };
  }

  if (!need || typeof need !== 'object') return null;
  const title = readString(need.title) || readString(need.name) || readString(need.id);
  if (!title) return null;
  const status = readString(need.status).toLowerCase();
  const originalNeedId = readString(need.id) || readString(need.originalNeedId) || readString(need.original_need_id) || title;
  const label = needLabel(originalNeedId);

  return {
    schoolId: school.id,
    submittedByUserId: school.submittedByUserId || null,
    originalNeedId,
    title,
    category: readString(need.category) || label.category,
    description: readString(need.description) || null,
    urgency: readString(need.urgency) || school.urgency || null,
    estimatedCost: numberOrNull(need.estimatedCost),
    quantityRequired: numberOrNull(need.quantityRequired),
    quantityFunded: Number(need.quantityFunded) || 0,
    images: Array.isArray(need.images) ? need.images : [],
    status: status === 'paused' || status === 'deleted' ? status : 'active',
  };
}

function serialize(row, extras = {}) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    submitted_by_user_id: data.submittedByUserId,
    original_need_id: data.originalNeedId,
    title: data.title,
    category: data.category,
    description: data.description,
    urgency: data.urgency,
    estimatedCost: data.estimatedCost,
    estimated_cost: data.estimatedCost,
    quantityRequired: data.quantityRequired,
    quantity_required: data.quantityRequired,
    quantityFunded: data.quantityFunded,
    quantity_funded: data.quantityFunded,
    images: Array.isArray(data.images) ? data.images : [],
    status: data.status,
    paused_at: data.pausedAt,
    paused_by_user_id: data.pausedByUserId,
    deleted_at: data.deletedAt,
    deleted_by_user_id: data.deletedByUserId,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    ...extras,
  };
}

function serializeForPublic(row) {
  const data = serialize(row);
  if (!data) return null;
  return {
    id: String(data.id),
    title: data.title,
    category: data.category,
    description: data.description,
    urgency: data.urgency,
    estimatedCost: data.estimatedCost,
    quantityRequired: data.quantityRequired,
    quantityFunded: data.quantityFunded,
    status: data.status,
    images: data.images,
  };
}

async function activeNeedsForSchool(school) {
  if (!school) return [];
  const rows = await SchoolNeed.findAll({
    where: { schoolId: school.id, status: 'active', deletedAt: null },
    order: [['id', 'ASC']],
  });
  if (rows.length) return rows.map(serializeForPublic);
  const tableRows = await SchoolNeed.count({ where: { schoolId: school.id } });
  if (tableRows > 0) return [];
  const legacy = Array.isArray(school.needs) ? school.needs : [];
  return legacy.map((need) => normalizeNeed(need, school)).filter(Boolean).map((need, index) => ({
    id: String(need.originalNeedId || `${school.id}-need-${index + 1}`),
    title: need.title,
    category: need.category,
    description: need.description,
    urgency: need.urgency,
    estimatedCost: need.estimatedCost,
    quantityRequired: need.quantityRequired,
    quantityFunded: need.quantityFunded,
    status: 'active',
    images: need.images,
  }));
}

async function activeNeedValuesForSchool(school) {
  if (!school) return [];
  const rows = await SchoolNeed.findAll({
    where: { schoolId: school.id, status: 'active', deletedAt: null },
    order: [['id', 'ASC']],
  });
  if (rows.length) {
    return rows
      .map((row) => {
        const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
        return readString(data.originalNeedId) || readString(data.title);
      })
      .filter(Boolean);
  }
  const tableRows = await SchoolNeed.count({ where: { schoolId: school.id } });
  if (tableRows > 0) return [];
  return (Array.isArray(school.needs) ? school.needs : [])
    .map((need) => (typeof need === 'string' ? readString(need) : readString(need?.id || need?.originalNeedId || need?.title)))
    .filter(Boolean);
}

async function replaceSchoolNeedsFromPayload(school, needs, transaction = null) {
  if (!Array.isArray(needs)) return;
  const rows = needs.map((need) => normalizeNeed(need, school)).filter(Boolean);
  await SchoolNeed.update(
    { status: 'deleted', deletedAt: new Date() },
    { where: { schoolId: school.id, deletedAt: null }, transaction }
  );
  if (rows.length) {
    await SchoolNeed.bulkCreate(rows.map((row) => ({ ...row, schoolId: school.id })), { transaction });
  }
}

async function list(query = {}) {
  const where = {};
  const status = readString(query.status).toLowerCase();
  if (STATUSES.has(status)) where.status = status;
  if (status !== 'deleted') where.deletedAt = null;
  if (query.school_id) where.schoolId = Number(query.school_id);
  if (query.search) where.title = { [Op.like]: `%${String(query.search).trim()}%` };

  const limit = Math.max(1, Math.min(Number(query.limit) || 50, 100));
  const page = Math.max(1, Number(query.page) || 1);
  const { rows, count } = await SchoolNeed.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  const items = await Promise.all(rows.map(async (need) => {
    const [school, location, submitter] = await Promise.all([
      School.findByPk(need.schoolId),
      SchoolLocation.findOne({ where: { schoolId: need.schoolId } }),
      need.submittedByUserId ? User.findByPk(need.submittedByUserId) : null,
    ]);
    return serialize(need, {
      school: school ? {
        id: school.id,
        school_name: school.schoolName,
        status: school.status,
        submitted_by_user_id: school.submittedByUserId,
        submitted_by: sanitizeUser(submitter),
        location: location ? {
          state: location.state,
          lga: location.lga,
          community: location.community,
          address: location.address,
        } : null,
      } : null,
    });
  }));

  return { items, pagination: { total: count, page, limit } };
}

async function get(id) {
  const row = await SchoolNeed.findByPk(id);
  if (!row) {
    const error = new Error('Need not found.');
    error.status = 404;
    throw error;
  }
  return row;
}

async function updateStatus(id, status, adminId) {
  const nextStatus = readString(status).toLowerCase();
  if (!['active', 'paused'].includes(nextStatus)) {
    const error = new Error('Status must be active or paused.');
    error.status = 422;
    error.code = 'VALIDATION_ERROR';
    error.fields = { status: 'Choose active or paused' };
    throw error;
  }

  const row = await get(id);
  await row.update({
    status: nextStatus,
    pausedAt: nextStatus === 'paused' ? new Date() : null,
    pausedByUserId: nextStatus === 'paused' ? adminId : null,
    deletedAt: null,
    deletedByUserId: null,
  });
  return row;
}

async function softDelete(id, adminId) {
  const row = await get(id);
  await row.update({
    status: 'deleted',
    deletedAt: new Date(),
    deletedByUserId: adminId,
  });
  return row;
}

module.exports = {
  STATUSES,
  activeNeedValuesForSchool,
  activeNeedsForSchool,
  get,
  list,
  normalizeNeed,
  replaceSchoolNeedsFromPayload,
  serialize,
  serializeForPublic,
  softDelete,
  updateStatus,
};
