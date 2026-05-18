'use strict';

const Op = require('@core/util/classes/Operators');
const { sequelize } = require('@core/util/classes/Model');
const User = require('@src/models/User');
const VolunteerProfile = require('@src/models/VolunteerProfile');
const School = require('@src/models/School');
const SchoolOperator = require('@src/models/SchoolOperator');
const SchoolLocation = require('@src/models/SchoolLocation');
const SchoolPhoto = require('@src/models/SchoolPhoto');
const SchoolChildrenStats = require('@src/models/SchoolChildrenStats');
const SchoolWelfareAssessment = require('@src/models/SchoolWelfareAssessment');
const SchoolReview = require('@src/models/SchoolReview');
const SchoolView = require('@src/models/SchoolView');
const VolunteerActivityLog = require('@src/models/VolunteerActivityLog');
const AdminNotification = require('@src/models/AdminNotification');
const VolunteerNotification = require('@src/models/VolunteerNotification');
const { sanitizeUser } = require('@src/services/auth/credentials');
const ProfileStore = require('@src/services/VolunteerProfileStore');

const EDITABLE_STATUSES = new Set(['draft', 'rejected']);
const REVIEW_STATUSES = new Set(['approved', 'rejected']);
const SCHOOL_TYPES = new Set([
  'traditional_quranic_school',
  'integrated_quranic_school',
  'informal_islamic_school',
  'non_formal_education_center',
  'community_islamic_school',
]);
const SCHOOL_STATUSES = new Set(['draft', 'pending', 'approved', 'rejected']);

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pick(body, camel, snake = null) {
  if (!body || typeof body !== 'object') return undefined;
  if (body[camel] !== undefined) return body[camel];
  if (snake && body[snake] !== undefined) return body[snake];
  return undefined;
}

function clean(payload) {
  return Object.entries(payload).reduce((carry, [key, value]) => {
    if (value !== undefined) carry[key] = typeof value === 'string' ? value.trim() : value;
    return carry;
  }, {});
}

function normalizeSchoolPayload(input = {}) {
  const body = input.school && typeof input.school === 'object' ? input.school : input;
  return clean({
    uniqueSiteId: pick(body, 'uniqueSiteId', 'unique_site_id'),
    schoolName: pick(body, 'schoolName', 'school_name'),
    localName: pick(body, 'localName', 'local_name'),
    schoolType: pick(body, 'schoolType', 'school_type'),
    operatorName: pick(body, 'operatorName', 'operator_name'),
    phone: pick(body, 'phone'),
    urgency: pick(body, 'urgency'),
    needs: Array.isArray(pick(body, 'needs')) ? pick(body, 'needs') : undefined,
    correctionIssues: Array.isArray(pick(body, 'correctionIssues', 'correction_issues')) ? pick(body, 'correctionIssues', 'correction_issues') : undefined,
    adminFeedback: pick(body, 'adminFeedback', 'admin_feedback'),
  });
}

function normalizeOperatorPayload(input = {}) {
  return clean({
    name: pick(input, 'name'),
    phone: pick(input, 'phone'),
  });
}

function normalizeLocationPayload(input = {}) {
  return clean({
    latitude: pick(input, 'latitude'),
    longitude: pick(input, 'longitude'),
    country: pick(input, 'country'),
    state: pick(input, 'state'),
    lga: pick(input, 'lga'),
    ward: pick(input, 'ward'),
    community: pick(input, 'community'),
    landmark: pick(input, 'landmark'),
    address: pick(input, 'address'),
  });
}

function normalizeChildrenPayload(input = {}) {
  return clean({
    totalChildren: pick(input, 'totalChildren', 'total_children'),
    residentialChildren: pick(input, 'residentialChildren', 'residential_children'),
    nonResidentialChildren: pick(input, 'nonResidentialChildren', 'non_residential_children'),
    boysCount: pick(input, 'boysCount', 'boys_count'),
    girlsCount: pick(input, 'girlsCount', 'girls_count'),
    age35Count: pick(input, 'age35Count', 'age_3_5_count'),
    age610Count: pick(input, 'age610Count', 'age_6_10_count'),
    age1115Count: pick(input, 'age1115Count', 'age_11_15_count'),
    age1618Count: pick(input, 'age1618Count', 'age_16_18_count'),
    age18PlusCount: pick(input, 'age18PlusCount', 'age_18_plus_count'),
    age0to5: pick(input, 'age0to5', 'age_0_to_5'),
    age6to9: pick(input, 'age6to9', 'age_6_to_9'),
    age10to14: pick(input, 'age10to14', 'age_10_to_14'),
    age15plus: pick(input, 'age15plus', 'age_15_plus'),
    ageGroups: pick(input, 'ageGroups', 'age_groups'),
    notes: pick(input, 'notes'),
  });
}

function normalizeWelfarePayload(input = {}) {
  return clean({
    hasCleanWater: pick(input, 'hasCleanWater', 'has_clean_water'),
    hasSanitation: pick(input, 'hasSanitation', 'has_sanitation'),
    hasHealthcare: pick(input, 'hasHealthcare', 'has_healthcare'),
    hasNutritiousFood: pick(input, 'hasNutritiousFood', 'has_nutritious_food'),
    hasEducationalMaterials: pick(input, 'hasEducationalMaterials', 'has_educational_materials'),
    hasRecreationalFacilities: pick(input, 'hasRecreationalFacilities', 'has_recreational_facilities'),
    hasClothingShelter: pick(input, 'hasClothingShelter', 'has_clothing_shelter'),
    hasSleepingArea: pick(input, 'hasSleepingArea', 'has_sleeping_area'),
    hasElectricity: pick(input, 'hasElectricity', 'has_electricity'),
    hasInternet: pick(input, 'hasInternet', 'has_internet'),
    hasTransportation: pick(input, 'hasTransportation', 'has_transportation'),
    hasFinancialResources: pick(input, 'hasFinancialResources', 'has_financial_resources'),
    safetyPhysicalAbuse: pick(input, 'safetyPhysicalAbuse', 'safety_physical_abuse'),
    safetyChildLabor: pick(input, 'safetyChildLabor', 'safety_child_labor'),
    safetySexualAbuse: pick(input, 'safetySexualAbuse', 'safety_sexual_abuse'),
    safetyTrafficking: pick(input, 'safetyTrafficking', 'safety_trafficking'),
    additionalNotes: pick(input, 'additionalNotes', 'additional_notes'),
    feedingStatus: pick(input, 'feedingStatus', 'feeding_status'),
    shelterStatus: pick(input, 'shelterStatus', 'shelter_status'),
    sanitationStatus: pick(input, 'sanitationStatus', 'sanitation_status'),
    waterAccess: pick(input, 'waterAccess', 'water_access'),
    healthAccess: pick(input, 'healthAccess', 'health_access'),
    clothingStatus: pick(input, 'clothingStatus', 'clothing_status'),
    mealsPerDay: pick(input, 'mealsPerDay', 'meals_per_day'),
    waterSource: pick(input, 'waterSource', 'water_source'),
    hasToiletAccess: pick(input, 'hasToiletAccess', 'has_toilet_access'),
    hasAdequateClothing: pick(input, 'hasAdequateClothing', 'has_adequate_clothing'),
    hasHealthcareAccess: pick(input, 'hasHealthcareAccess', 'has_healthcare_access'),
    sleepingArrangement: pick(input, 'sleepingArrangement', 'sleeping_arrangement'),
    hygieneCondition: pick(input, 'hygieneCondition', 'hygiene_condition'),
    safetyRisks: pick(input, 'safetyRisks', 'safety_risks'),
    immediateInterventionNeeded: pick(input, 'immediateInterventionNeeded', 'immediate_intervention_needed'),
    urgencyReason: pick(input, 'urgencyReason', 'urgency_reason'),
    followUpDate: pick(input, 'followUpDate', 'follow_up_date'),
    notes: pick(input, 'notes'),
  });
}

function normalizePhotoPayload(input = {}) {
  return clean({
    clientId: pick(input, 'clientId', 'client_id') || pick(input, 'id'),
    fileUrl: pick(input, 'fileUrl', 'file_url') || pick(input, 'url'),
    localPath: pick(input, 'localPath', 'local_path'),
    mediaKind: pick(input, 'mediaKind', 'media_kind'),
    mimeType: pick(input, 'mimeType', 'mime_type'),
    size: pick(input, 'size'),
    category: pick(input, 'category') || pick(input, 'type') || 'other',
    caption: pick(input, 'caption'),
    capturedAt: pick(input, 'capturedAt', 'captured_at') || pick(input, 'timestamp'),
    latitude: pick(input, 'latitude'),
    longitude: pick(input, 'longitude'),
  });
}

function serializeSchoolRow(school) {
  if (!school) return null;
  const row = typeof school.toJSON === 'function' ? school.toJSON() : school;
  return {
    id: row.id,
    submitted_by_user_id: row.submittedByUserId,
    approved_by_user_id: row.approvedByUserId,
    unique_site_id: row.uniqueSiteId,
    school_name: row.schoolName,
    local_name: row.localName,
    school_type: row.schoolType,
    operator_name: row.operatorName,
    phone: row.phone,
    status: row.status,
    urgency: row.urgency,
    needs: Array.isArray(row.needs) ? row.needs : [],
    correction_issues: Array.isArray(row.correctionIssues) ? row.correctionIssues : [],
    admin_feedback: row.adminFeedback,
    submitted_at: row.submittedAt,
    reviewed_at: row.reviewedAt,
    archived_at: row.archivedAt,
    archived_by_user_id: row.archivedByUserId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

function serializeOperator(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return { id: data.id, school_id: data.schoolId, name: data.name, phone: data.phone };
}

function serializeLocation(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    latitude: data.latitude,
    longitude: data.longitude,
    country: data.country,
    state: data.state,
    lga: data.lga,
    ward: data.ward,
    community: data.community,
    landmark: data.landmark,
    address: data.address,
  };
}

function serializeChildren(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    total_children: data.totalChildren,
    residential_children: data.residentialChildren,
    non_residential_children: data.nonResidentialChildren,
    boys_count: data.boysCount,
    girls_count: data.girlsCount,
    age_3_5_count: data.age35Count,
    age_6_10_count: data.age610Count,
    age_11_15_count: data.age1115Count,
    age_16_18_count: data.age1618Count,
    age_18_plus_count: data.age18PlusCount,
    age_0_to_5: data.age0to5,
    age_6_to_9: data.age6to9,
    age_10_to_14: data.age10to14,
    age_15_plus: data.age15plus,
    age_groups: data.ageGroups,
    notes: data.notes,
  };
}

function serializeWelfare(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    has_clean_water: data.hasCleanWater,
    has_sanitation: data.hasSanitation,
    has_healthcare: data.hasHealthcare,
    has_nutritious_food: data.hasNutritiousFood,
    has_educational_materials: data.hasEducationalMaterials,
    has_recreational_facilities: data.hasRecreationalFacilities,
    has_clothing_shelter: data.hasClothingShelter,
    has_sleeping_area: data.hasSleepingArea,
    has_electricity: data.hasElectricity,
    has_internet: data.hasInternet,
    has_transportation: data.hasTransportation,
    has_financial_resources: data.hasFinancialResources,
    safety_physical_abuse: data.safetyPhysicalAbuse,
    safety_child_labor: data.safetyChildLabor,
    safety_sexual_abuse: data.safetySexualAbuse,
    safety_trafficking: data.safetyTrafficking,
    additional_notes: data.additionalNotes,
  };
}

function serializePhoto(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    uploaded_by_user_id: data.uploadedByUserId,
    client_id: data.clientId,
    file_url: data.fileUrl,
    local_path: data.localPath,
    media_kind: data.mediaKind || 'image',
    mime_type: data.mimeType,
    size: data.size,
    category: data.category,
    caption: data.caption,
    captured_at: data.capturedAt,
    latitude: data.latitude,
    longitude: data.longitude,
    created_at: data.createdAt,
  };
}

function serializeReview(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    school_id: data.schoolId,
    reviewed_by_user_id: data.reviewedByUserId,
    status: data.status,
    comment: data.comment,
    created_at: data.createdAt,
  };
}

function serializeNotification(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    actor_user_id: data.actorUserId,
    school_id: data.schoolId,
    type: data.type,
    title: data.title,
    message: data.message,
    status: data.status,
    read_at: data.readAt,
    resolved_at: data.resolvedAt,
    metadata: data.metadata,
    created_at: data.createdAt,
  };
}

function serializeVolunteerNotification(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    recipient_user_id: data.recipientUserId,
    actor_user_id: data.actorUserId,
    school_id: data.schoolId,
    type: data.type,
    title: data.title,
    message: data.message,
    status: data.status,
    read_at: data.readAt,
    metadata: data.metadata,
    created_at: data.createdAt,
  };
}

async function serializeSchoolAggregate(school) {
  if (!school) return null;
  const [operators, location, childrenStats, welfare, photos, reviews, submittedBy, approvedBy, archivedBy] = await Promise.all([
    SchoolOperator.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] }),
    SchoolLocation.findOne({ where: { schoolId: school.id } }),
    SchoolChildrenStats.findOne({ where: { schoolId: school.id } }),
    SchoolWelfareAssessment.findOne({ where: { schoolId: school.id } }),
    SchoolPhoto.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] }),
    SchoolReview.findAll({ where: { schoolId: school.id }, order: [['id', 'DESC']] }),
    User.findByPk(school.submittedByUserId),
    school.approvedByUserId ? User.findByPk(school.approvedByUserId) : null,
    school.archivedByUserId ? User.findByPk(school.archivedByUserId) : null,
  ]);

  return {
    ...serializeSchoolRow(school),
    submitted_by: sanitizeUser(submittedBy),
    approved_by: sanitizeUser(approvedBy),
    archived_by: sanitizeUser(archivedBy),
    operators: operators.map(serializeOperator),
    location: serializeLocation(location),
    children_stats: serializeChildren(childrenStats),
    welfare: serializeWelfare(welfare),
    photos: photos.map(serializePhoto),
    reviews: reviews.map(serializeReview),
  };
}

async function serializeSchoolListRow(school) {
  const [location, submittedBy] = await Promise.all([
    SchoolLocation.findOne({ where: { schoolId: school.id } }),
    User.findByPk(school.submittedByUserId),
  ]);
  return {
    ...serializeSchoolRow(school),
    submitted_by: sanitizeUser(submittedBy),
    location: serializeLocation(location),
  };
}

async function locationSchoolIds(query = {}) {
  const locationWhere = {};
  if (query.state) locationWhere.state = query.state;
  if (query.lga) locationWhere.lga = query.lga;
  if (!Object.keys(locationWhere).length) return null;
  const rows = await SchoolLocation.findAll({ where: locationWhere });
  return rows.map((row) => row.schoolId);
}

async function buildSchoolWhere(query = {}, defaults = {}) {
  const where = { ...defaults };
  if (query.archived === 'true') {
    where.archivedAt = { [Op.ne]: null };
  } else if (query.archived !== 'all') {
    where.archivedAt = null;
  }
  if (query.status && SCHOOL_STATUSES.has(query.status)) where.status = query.status;
  if (query.submitted_by_user_id) where.submittedByUserId = Number(query.submitted_by_user_id);
  if (query.school_type) where.schoolType = query.school_type;
  if (query.urgency) where.urgency = query.urgency;
  if (query.search) where.schoolName = { [Op.like]: `%${String(query.search).trim()}%` };
  const ids = await locationSchoolIds(query);
  if (ids) where.id = ids.length ? ids : [-1];
  return where;
}

function pagination(query = {}) {
  const limit = Math.max(1, Math.min(Number(query.limit) || 25, 100));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, offset: (page - 1) * limit, page };
}

async function listSchools(query = {}, defaults = {}) {
  const { limit, offset, page } = pagination(query);
  const { rows, count } = await School.findAndCountAll({
    where: await buildSchoolWhere(query, defaults),
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  return {
    items: await Promise.all(rows.map(serializeSchoolListRow)),
    pagination: { total: count, page, limit },
  };
}

async function getSchool(id) {
  return School.findByPk(id);
}

async function getOwnedSchool(id, userId) {
  return School.findOne({ where: { id, submittedByUserId: userId } });
}

async function requireEditable(school) {
  if (!school) {
    const error = new Error('School not found');
    error.status = 404;
    throw error;
  }
  if (!EDITABLE_STATUSES.has(school.status)) {
    const error = new Error('Only draft or rejected schools can be edited');
    error.status = 409;
    throw error;
  }
}

async function upsertOne(Model, where, payload, transaction) {
  if (!payload || Object.keys(payload).length === 0) return null;
  const existing = await Model.findOne({ where, transaction });
  return existing
    ? existing.update(payload, { transaction })
    : Model.create({ ...where, ...payload }, { transaction });
}

async function replaceOperators(schoolId, operators, transaction) {
  if (!Array.isArray(operators)) return;
  await SchoolOperator.destroy({ where: { schoolId }, transaction });
  const rows = operators.map(normalizeOperatorPayload).filter((row) => readString(row.name));
  if (rows.length) {
    await SchoolOperator.bulkCreate(rows.map((row) => ({ ...row, schoolId })), { transaction });
  }
}

async function applyAggregatePayload(school, payload, userId, transaction) {
  const schoolPayload = normalizeSchoolPayload(payload);
  if (Object.keys(schoolPayload).length) {
    await school.update(schoolPayload, { transaction });
  }

  if (payload.operators !== undefined) await replaceOperators(school.id, payload.operators, transaction);
  if (payload.location !== undefined) {
    await upsertOne(SchoolLocation, { schoolId: school.id }, normalizeLocationPayload(payload.location), transaction);
  }
  if (payload.children_stats !== undefined || payload.childrenStats !== undefined) {
    await upsertOne(SchoolChildrenStats, { schoolId: school.id }, normalizeChildrenPayload(payload.children_stats || payload.childrenStats), transaction);
  }
  if (payload.welfare !== undefined) {
    await upsertOne(SchoolWelfareAssessment, { schoolId: school.id }, normalizeWelfarePayload(payload.welfare), transaction);
  }
  if (Array.isArray(payload.photos)) {
    const photos = payload.photos.map(normalizePhotoPayload).filter((row) => readString(row.fileUrl));
    if (photos.length) {
      await SchoolPhoto.bulkCreate(photos.map((row) => ({ ...row, schoolId: school.id, uploadedByUserId: userId })), { transaction });
    }
  }
}

function validateSubmission(school) {
  const errors = [];
  if (!readString(school.schoolName)) errors.push('School name is required');
  if (!readString(school.schoolType)) errors.push('School type is required');
  if (school.schoolType && !SCHOOL_TYPES.has(school.schoolType)) errors.push('School type is invalid');
  if (school.urgency && !['high', 'medium', 'low'].includes(school.urgency)) errors.push('Urgency is invalid');
  return errors;
}

async function createSchool(userId, payload = {}, status = 'draft') {
  return sequelize.transaction(async (transaction) => {
    const schoolPayload = normalizeSchoolPayload(payload);
    const now = new Date();
    const school = await School.create({
      ...schoolPayload,
      submittedByUserId: userId,
      status,
      submittedAt: status === 'pending' ? now : null,
    }, { transaction });

    await applyAggregatePayload(school, payload, userId, transaction);

    if (status === 'pending') {
      const errors = validateSubmission(school);
      if (errors.length) {
        const error = new Error(errors[0]);
        error.status = 400;
        throw error;
      }
      await createSubmissionSideEffects(school, userId, transaction);
    } else {
      await VolunteerActivityLog.create({ userId, schoolId: school.id, action: 'school_drafted' }, { transaction });
    }

    return school;
  });
}

async function updateSchool(school, payload = {}, userId) {
  await requireEditable(school);
  return sequelize.transaction(async (transaction) => {
    await applyAggregatePayload(school, payload, userId, transaction);
    await VolunteerActivityLog.create({ userId, schoolId: school.id, action: 'school_updated' }, { transaction });
    return school.reload({ transaction });
  });
}

async function updateSchoolAsAdmin(school, payload = {}, adminId) {
  if (!school) {
    const error = new Error('School not found');
    error.status = 404;
    throw error;
  }
  return sequelize.transaction(async (transaction) => {
    await applyAggregatePayload(school, payload, adminId, transaction);
    await VolunteerActivityLog.create({
      userId: school.submittedByUserId,
      schoolId: school.id,
      action: 'school_admin_updated',
      metadata: { adminId },
    }, { transaction });
    return school.reload({ transaction });
  });
}

async function archiveSchool(school, adminId) {
  if (!school) {
    const error = new Error('School not found');
    error.status = 404;
    throw error;
  }
  if (school.archivedAt) return school;
  await school.update({ archivedAt: new Date(), archivedByUserId: adminId });
  return school.reload();
}

async function restoreSchool(school) {
  if (!school) {
    const error = new Error('School not found');
    error.status = 404;
    throw error;
  }
  await school.update({ archivedAt: null, archivedByUserId: null });
  return school.reload();
}

async function deleteSchool(school) {
  await requireEditable(school);
  return sequelize.transaction(async (transaction) => {
    await Promise.all([
      SchoolOperator.destroy({ where: { schoolId: school.id }, transaction }),
      SchoolLocation.destroy({ where: { schoolId: school.id }, transaction }),
      SchoolChildrenStats.destroy({ where: { schoolId: school.id }, transaction }),
      SchoolWelfareAssessment.destroy({ where: { schoolId: school.id }, transaction }),
      SchoolPhoto.destroy({ where: { schoolId: school.id }, transaction }),
      VolunteerActivityLog.destroy({ where: { schoolId: school.id }, transaction }),
    ]);
    await school.destroy({ transaction });
  });
}

async function submitSchool(school, userId) {
  await requireEditable(school);
  const errors = validateSubmission(school);
  if (errors.length) {
    const error = new Error(errors[0]);
    error.status = 400;
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    await school.update({ status: 'pending', submittedAt: new Date(), adminFeedback: null }, { transaction });
    await createSubmissionSideEffects(school, userId, transaction);
    return school.reload({ transaction });
  });
}

async function createSubmissionSideEffects(school, userId, transaction) {
  const volunteer = await User.findByPk(userId, { transaction });
  const volunteerName = volunteer ? volunteer.name : 'A volunteer';
  const schoolName = school.schoolName || `School #${school.id}`;

  await VolunteerActivityLog.create({ userId, schoolId: school.id, action: 'school_submitted' }, { transaction });
  await AdminNotification.create({
    actorUserId: userId,
    schoolId: school.id,
    type: 'school_submitted',
    title: 'New school submitted',
    message: `${volunteerName} submitted ${schoolName} for review.`,
    status: 'unread',
    metadata: { school_id: school.id, school_name: schoolName },
  }, { transaction });
}

async function reviewSchool(school, adminId, status, comment) {
  if (!school) {
    const error = new Error('School not found');
    error.status = 404;
    throw error;
  }
  if (school.archivedAt) {
    const error = new Error('Archived schools must be restored before review.');
    error.status = 409;
    throw error;
  }
  if (!REVIEW_STATUSES.has(status)) {
    const error = new Error('Status must be approved or rejected');
    error.status = 400;
    throw error;
  }
  if (school.status !== 'pending') {
    const error = new Error('Only pending schools can be reviewed');
    error.status = 409;
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    await SchoolReview.create({
      schoolId: school.id,
      reviewedByUserId: adminId,
      status,
      comment: readString(comment) || null,
    }, { transaction });

    await school.update({
      status,
      approvedByUserId: status === 'approved' ? adminId : null,
      adminFeedback: readString(comment) || null,
      reviewedAt: new Date(),
    }, { transaction });

    await AdminNotification.update(
      { status: 'resolved', resolvedAt: new Date() },
      { where: { schoolId: school.id, type: 'school_submitted' }, transaction }
    );

    await VolunteerActivityLog.create({
      userId: school.submittedByUserId,
      schoolId: school.id,
      action: status === 'approved' ? 'school_approved' : 'school_rejected',
      metadata: { comment: readString(comment) || null },
    }, { transaction });

    const schoolName = school.schoolName || `School #${school.id}`;
    const approved = status === 'approved';
    await VolunteerNotification.create({
      recipientUserId: school.submittedByUserId,
      actorUserId: adminId,
      schoolId: school.id,
      type: approved ? 'school_approved' : 'school_rejected',
      title: approved ? 'School approved' : 'School rejected',
      message: approved
        ? `${schoolName} has been approved by the admin.`
        : `${schoolName} was rejected by the admin.${readString(comment) ? ` Feedback: ${readString(comment)}` : ''}`,
      status: 'unread',
      metadata: {
        school_id: school.id,
        school_name: schoolName,
        status,
        comment: readString(comment) || null,
      },
    }, { transaction });

    return school.reload({ transaction });
  });
}

async function dashboardStatsForVolunteer(userId) {
  const where = { submittedByUserId: userId };
  const [totalSubmitted, pending, approved, rejected, drafts, unreadNotifications] = await Promise.all([
    School.count({ where: { ...where, status: { [Op.ne]: 'draft' } } }),
    School.count({ where: { ...where, status: 'pending' } }),
    School.count({ where: { ...where, status: 'approved' } }),
    School.count({ where: { ...where, status: 'rejected' } }),
    School.count({ where: { ...where, status: 'draft' } }),
    VolunteerNotification.count({ where: { recipientUserId: userId, status: 'unread' } }),
  ]);

  return {
    total_submitted: totalSubmitted,
    pending,
    approved,
    rejected,
    drafts,
    unread_notifications: unreadNotifications,
  };
}

async function dashboardStatsForAdmin() {
  const [pendingReviews, approvedSchools, rejectedSchools, totalVolunteers, completedProfiles, unreadNotifications] = await Promise.all([
    School.count({ where: { status: 'pending' } }),
    School.count({ where: { status: 'approved' } }),
    School.count({ where: { status: 'rejected' } }),
    User.count({ where: { role: 'volunteer' } }),
    VolunteerProfile.count({ where: { isCompleted: true } }),
    AdminNotification.count({ where: { status: 'unread' } }),
  ]);

  return {
    pending_reviews: pendingReviews,
    approved_schools: approvedSchools,
    rejected_schools: rejectedSchools,
    total_volunteers: totalVolunteers,
    completed_volunteer_profiles: completedProfiles,
    unread_notifications: unreadNotifications,
  };
}

function countRows(rows, key, fallback = 'Unknown') {
  const counts = new Map();
  for (const row of rows) {
    const raw = typeof row.get === 'function' ? row.get(key) : row[key];
    const label = readString(raw) || fallback;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function normalizeAnalyticsRows(rows, key) {
  return rows.map((row) => ({ [key]: row.label, count: row.count }));
}

function topStatesWithUnknown(rows) {
  const counted = countRows(rows, 'state', 'Unknown');
  const unknown = counted.find((row) => row.label === 'Unknown');
  const known = counted.filter((row) => row.label !== 'Unknown').slice(0, 10);
  return normalizeAnalyticsRows(unknown && unknown.count > 0 ? [...known, unknown] : known, 'state');
}

async function dashboardAnalyticsForAdmin() {
  const [schools, locations, users, completedProfiles] = await Promise.all([
    School.findAll({ attributes: ['status', 'urgency'] }),
    SchoolLocation.findAll({ attributes: ['state'] }),
    User.findAll({ attributes: ['status'] }),
    VolunteerProfile.count({ where: { isCompleted: true } }),
  ]);

  const totalVolunteers = await User.count({ where: { role: 'volunteer' } });
  const incompleteProfiles = Math.max(0, totalVolunteers - completedProfiles);

  return {
    schools_by_status: normalizeAnalyticsRows(countRows(schools, 'status'), 'status'),
    schools_by_urgency: normalizeAnalyticsRows(countRows(schools, 'urgency'), 'urgency'),
    schools_by_state: topStatesWithUnknown(locations),
    users_by_status: normalizeAnalyticsRows(countRows(users, 'status'), 'status'),
    volunteer_profile_completion: [
      { status: 'complete', count: completedProfiles },
      { status: 'incomplete', count: incompleteProfiles },
    ],
  };
}

async function volunteerSummary(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'volunteer') return null;
  const profile = await VolunteerProfile.findOne({ where: { userId } });
  const stats = await dashboardStatsForVolunteer(userId);
  return {
    volunteer: {
      ...sanitizeUser(user),
      profile: ProfileStore.serialize(profile),
    },
    stats,
  };
}

async function logView(schoolId, userId) {
  return SchoolView.create({ schoolId, userId, viewedAt: new Date() });
}

module.exports = {
  AdminNotification,
  School,
  SchoolChildrenStats,
  SchoolLocation,
  SchoolOperator,
  SchoolPhoto,
  SchoolReview,
  SchoolWelfareAssessment,
  VolunteerNotification,
  archiveSchool,
  buildSchoolWhere,
  createSchool,
  dashboardAnalyticsForAdmin,
  dashboardStatsForAdmin,
  dashboardStatsForVolunteer,
  deleteSchool,
  getOwnedSchool,
  getSchool,
  listSchools,
  logView,
  normalizeChildrenPayload,
  normalizeLocationPayload,
  normalizeOperatorPayload,
  normalizePhotoPayload,
  normalizeWelfarePayload,
  reviewSchool,
  requireEditable,
  serializeChildren,
  serializeLocation,
  serializeNotification,
  serializeOperator,
  serializePhoto,
  serializeSchoolAggregate,
  serializeSchoolListRow,
  serializeSchoolRow,
  serializeVolunteerNotification,
  serializeWelfare,
  submitSchool,
  updateSchool,
  updateSchoolAsAdmin,
  restoreSchool,
  upsertOne,
  volunteerSummary,
};
