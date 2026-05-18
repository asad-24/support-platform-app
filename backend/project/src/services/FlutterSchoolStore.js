'use strict';

const path = require('path');
const fs = require('fs');
const Op = require('@core/util/classes/Operators');
const SQL = require('@core/util/classes/SQL');
const { sequelize } = require('@core/util/classes/Model');
const School = require('@src/models/School');
const SchoolOperator = require('@src/models/SchoolOperator');
const SchoolLocation = require('@src/models/SchoolLocation');
const SchoolPhoto = require('@src/models/SchoolPhoto');
const SchoolChildrenStats = require('@src/models/SchoolChildrenStats');
const SchoolWelfareAssessment = require('@src/models/SchoolWelfareAssessment');
const VolunteerActivityLog = require('@src/models/VolunteerActivityLog');
const AdminNotification = require('@src/models/AdminNotification');
const SchoolView = require('@src/models/SchoolView');
const User = require('@src/models/User');

const NEEDS = new Set([
  'feeding',
  'clothing',
  'bedding',
  'shelterImprovement',
  'healthOutreach',
  'counselling',
  'sanitation',
  'waterAccess',
  'hygieneKits',
  'educationMaterials',
  'safeguarding',
  'identityDocumentation',
  'other',
]);

const MEDIA_TYPES = new Set(['entrance', 'class_area', 'sleeping_area', 'sanitation', 'environment', 'other']);
const MEDIA_KINDS = new Set(['image', 'video']);
const URGENCY = new Set(['low', 'medium', 'high']);
const STATUS_BY_REVIEW = {
  approved: 'approved',
  pendingVerification: 'pending',
  needsCorrection: 'rejected',
};

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function maybeString(value) {
  const str = readString(value);
  return str || null;
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function intOrNull(value) {
  const number = numberOrNull(value);
  return number === null ? null : Math.trunc(number);
}

function boolOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
  return Boolean(value);
}

function iso(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function clean(payload) {
  return Object.entries(payload).reduce((carry, [key, value]) => {
    if (value !== undefined) carry[key] = value;
    return carry;
  }, {});
}

function validationError(fields) {
  const error = new Error('Please correct the highlighted fields.');
  error.status = 400;
  error.body = {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Please correct the highlighted fields.',
      fields,
    },
  };
  return error;
}

function forbidden(message = 'You do not have access to this resource.') {
  const error = new Error(message);
  error.status = 403;
  error.body = { error: { code: 'FORBIDDEN', message } };
  return error;
}

function notFound(message = 'Site not found') {
  const error = new Error(message);
  error.status = 404;
  error.body = { error: { code: 'NOT_FOUND', message } };
  return error;
}

function conflict(message) {
  const error = new Error(message);
  error.status = 409;
  error.body = { error: { code: 'CONFLICT', message } };
  return error;
}

class FlutterSchoolStore {
  constructor() {
    this.db = SQL.default;
    this.sequelize = sequelize;
  }

  async listSites(query = {}, user = null) {
    const where = this.buildWhere(query, user, { defaultPublishedOnly: true });
    const rows = await School.findAll({ where, order: [['updatedAt', 'DESC']] });
    let items = await Promise.all(rows.map((school) => this.serializeSite(school)));
    if (query.need && NEEDS.has(query.need)) {
      items = items.filter((site) => site.needs.includes(query.need));
    }
    return { items, total: items.length };
  }

  async getVisibleSite(id, user = null) {
    const school = await this.findSchool(id);
    if (!school) throw notFound();
    if (school.archivedAt) throw notFound();

    const isOwner = user && Number(user.id) === Number(school.submittedByUserId);
    const isAdmin = user && user.role === 'admin';
    if (school.status !== 'approved' && !isOwner && !isAdmin) throw notFound();

    if (user && school.status === 'approved') {
      await SchoolView.create({ schoolId: school.id, userId: user.id, viewedAt: new Date() });
    }

    return this.serializeSite(school);
  }

  async createSite(user, payload = {}, options = {}) {
    this.requireWriter(user);
    const fields = this.validateSitePayload(payload, { final: options.status !== 'draft' });
    if (Object.keys(fields).length) throw validationError(fields);

    return this.sequelize.transaction(async (transaction) => {
      const school = await School.create({
        ...this.normalizeSchool(payload),
        submittedByUserId: user.id,
        status: options.status || 'pending',
        submittedAt: options.status === 'draft' ? null : new Date(),
      }, { transaction });

      await this.ensureUniqueSiteId(school, payload, transaction);
      await this.applyPayload(school, payload, user, transaction, { includeLocalMedia: false });

      await VolunteerActivityLog.create({
        userId: user.id,
        schoolId: school.id,
        action: options.status === 'draft' ? 'school_drafted' : 'school_submitted',
      }, { transaction });

      if (options.status !== 'draft') {
        await this.createSubmissionNotification(school, user, transaction);
      }

      return this.serializeSite(await school.reload({ transaction }));
    });
  }

  async updateSite(id, user, payload = {}, query = {}) {
    const school = await this.findSchool(id);
    if (!school) throw notFound();
    this.requireCanModify(user, school);

    const correctionOnly = String(query.correctionOnly || query.correction_only || '').toLowerCase() === 'true';
    if (!this.canVolunteerEdit(user, school) && user.role !== 'admin') {
      throw conflict('Only draft or correction records can be edited.');
    }

    return this.sequelize.transaction(async (transaction) => {
      await this.applyPayload(school, payload, user, transaction, { includeLocalMedia: false });
      const update = {};
      if (correctionOnly || school.status === 'rejected') {
        update.status = 'pending';
        update.submittedAt = new Date();
        update.reviewedAt = null;
        update.approvedByUserId = null;
        update.adminFeedback = null;
        update.correctionIssues = [];
      }
      if (Object.keys(update).length) await school.update(update, { transaction });

      await VolunteerActivityLog.create({
        userId: user.id,
        schoolId: school.id,
        action: correctionOnly ? 'school_resubmitted' : 'school_updated',
      }, { transaction });

      return this.serializeSite(await school.reload({ transaction }));
    });
  }

  async deleteSite(id, user) {
    const school = await this.findSchool(id);
    if (!school) throw notFound();
    this.requireCanModify(user, school);
    if (user.role !== 'admin' && !['draft', 'rejected'].includes(school.status)) {
      throw conflict('Only draft or correction records can be deleted.');
    }

    await this.sequelize.transaction(async (transaction) => {
      await Promise.all([
        SchoolOperator.destroy({ where: { schoolId: school.id }, transaction }),
        SchoolLocation.destroy({ where: { schoolId: school.id }, transaction }),
        SchoolChildrenStats.destroy({ where: { schoolId: school.id }, transaction }),
        SchoolWelfareAssessment.destroy({ where: { schoolId: school.id }, transaction }),
        SchoolPhoto.destroy({ where: { schoolId: school.id }, transaction }),
        VolunteerActivityLog.destroy({ where: { schoolId: school.id }, transaction }),
        AdminNotification.destroy({ where: { schoolId: school.id }, transaction }),
      ]);
      await school.destroy({ transaction });
    });

    return { deleted: true };
  }

  async uploadMedia(siteId, user, payload = {}) {
    const school = await this.findSchool(siteId);
    if (!school) throw notFound();
    this.requireCanModify(user, school, { allowApprovedAdmin: true });

    const type = MEDIA_TYPES.has(payload.type) ? payload.type : 'other';
    const mimeType = maybeString(payload.mimeType);
    const mediaKind = MEDIA_KINDS.has(payload.mediaKind)
      ? payload.mediaKind
      : ((mimeType || '').startsWith('video/') ? 'video' : 'image');
    const fileName = readString(payload.filename) || readString(payload.fileName) || `${type}.jpg`;
    const fileUrl = readString(payload.url) || readString(payload.fileUrl)
      || `https://cdn.example.com/sites/${this.siteId(school)}/${encodeURIComponent(fileName)}`;
    const photo = await SchoolPhoto.create({
      schoolId: school.id,
      uploadedByUserId: user.id,
      clientId: maybeString(payload.id),
      fileUrl,
      localPath: maybeString(payload.localPath),
      mediaKind,
      mimeType,
      size: numberOrNull(payload.size),
      category: type,
      caption: maybeString(payload.caption),
      capturedAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      latitude: numberOrNull(payload.latitude),
      longitude: numberOrNull(payload.longitude),
    });

    return this.serializeMedia(photo, school);
  }

  async submitAssessment(siteId, user, payload = {}) {
    const school = await this.findSchool(siteId);
    if (!school) throw notFound();
    this.requireCanModify(user, school, { allowApprovedAdmin: true });
    await this.upsertOne(
      SchoolWelfareAssessment,
      { schoolId: school.id },
      this.normalizeWelfare(payload),
    );
    const welfare = await SchoolWelfareAssessment.findOne({ where: { schoolId: school.id } });
    return this.serializeWelfare(welfare);
  }

  async listSubmittedSites(userId, query = {}, user = null) {
    if (!user) throw forbidden();
    const requestedUserId = Number(userId);
    if (user.role !== 'admin' && Number(user.id) !== requestedUserId) throw forbidden();

    const where = {
      submittedByUserId: requestedUserId,
      status: { [Op.ne]: 'draft' },
      archivedAt: null,
    };
    if (query.reviewStatus && STATUS_BY_REVIEW[query.reviewStatus]) {
      where.status = STATUS_BY_REVIEW[query.reviewStatus];
    }
    const rows = await School.findAll({ where, order: [['updatedAt', 'DESC']] });
    const items = await Promise.all(rows.map((school) => this.serializeSite(school)));
    return { items, total: items.length };
  }

  async dashboardSummary() {
    const rows = await School.findAll({ where: { status: { [Op.ne]: 'draft' }, archivedAt: null } });
    const childrenRows = await SchoolChildrenStats.findAll({
      where: { schoolId: rows.map((row) => row.id) },
    });
    const childrenBySchool = new Map(childrenRows.map((row) => [Number(row.schoolId), row]));
    return {
      totalSites: rows.length,
      estimatedChildren: rows.reduce((sum, school) => {
        const children = childrenBySchool.get(Number(school.id));
        return sum + (children ? Number(children.totalChildren || 0) : 0);
      }, 0),
      pendingVerification: rows.filter((school) => school.status === 'pending').length,
      verifiedSites: rows.filter((school) => school.status === 'approved').length,
      highUrgencySites: rows.filter((school) => school.urgency === 'high').length,
    };
  }

  async exportSites() {
    const rows = await School.findAll({
      where: { status: 'approved', archivedAt: null },
      order: [['updatedAt', 'DESC']],
    });
    const sites = await Promise.all(rows.map((school) => this.serializeSite(school)));
    const header = 'uniqueSiteId,name,state,lga,community,verificationStatus,urgencyLevel,estimatedChildren';
    const lines = sites.map((site) => [
      site.uniqueSiteId,
      site.name,
      site.state,
      site.lga,
      site.community,
      site.verificationStatus,
      site.urgencyLevel,
      site.populationSummary ? site.populationSummary.totalChildren : 0,
    ].map((value) => this.csv(value)).join(','));
    const today = new Date().toISOString().slice(0, 10);
    return {
      fileName: `sites-export-${today}.csv`,
      contentType: 'text/csv',
      data: [header, ...lines].join('\n'),
    };
  }

  async listDrafts(user, query = {}) {
    this.requireWriter(user);
    const rows = await School.findAll({
      where: { submittedByUserId: user.id, status: 'draft', archivedAt: null },
      order: [['updatedAt', 'DESC']],
    });
    const items = await Promise.all(rows.map((school) => this.serializeDraft(school)));
    return { items, total: items.length };
  }

  async createDraft(user, payload = {}) {
    const site = await this.createSite(user, this.draftPayload(payload), { status: 'draft' });
    return this.getDraft(site.id, user);
  }

  async getDraft(id, user) {
    const school = await this.findSchool(id);
    if (!school || school.status !== 'draft') throw notFound('Draft not found');
    this.requireCanModify(user, school);
    return this.serializeDraft(school);
  }

  async updateDraft(id, user, payload = {}) {
    const school = await this.findSchool(id);
    if (!school || school.status !== 'draft') throw notFound('Draft not found');
    this.requireCanModify(user, school);
    await this.applyPayload(school, this.draftPayload(payload), user);
    return this.serializeDraft(await school.reload());
  }

  async deleteDraft(id, user) {
    const school = await this.findSchool(id);
    if (!school || school.status !== 'draft') throw notFound('Draft not found');
    return this.deleteSite(id, user);
  }

  async submitDraft(id, user) {
    const school = await this.findSchool(id);
    if (!school || school.status !== 'draft') throw notFound('Draft not found');
    this.requireCanModify(user, school);
    const fields = this.validateSitePayload(await this.serializeSite(school), { final: true });
    if (Object.keys(fields).length) throw validationError(fields);

    await this.sequelize.transaction(async (transaction) => {
      await school.update({ status: 'pending', submittedAt: new Date(), adminFeedback: null, correctionIssues: [] }, { transaction });
      await VolunteerActivityLog.create({ userId: user.id, schoolId: school.id, action: 'school_submitted' }, { transaction });
      await this.createSubmissionNotification(school, user, transaction);
    });
    return this.serializeSite(await school.reload());
  }

  async nigeriaStatesAndLgas() {
    const filePath = path.resolve(process.cwd(), '..', '..', 'app', 'assets', 'data', 'nigeria_states_lgas.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  }

  buildWhere(query = {}, user = null, options = {}) {
    const where = { archivedAt: null };
    const isAdmin = user && user.role === 'admin';

    if (options.defaultPublishedOnly && !isAdmin) {
      where.status = 'approved';
    }

    if (query.verificationStatus) {
      const status = this.statusFromVerification(query.verificationStatus);
      if (status && (isAdmin || status === 'approved')) where.status = status;
    }
    if (query.urgencyLevel && URGENCY.has(query.urgencyLevel)) where.urgency = query.urgencyLevel;
    if (query.query || query.search) where.schoolName = { [Op.like]: `%${readString(query.query || query.search)}%` };
    return where;
  }

  async findSchool(id) {
    const numericId = String(id || '').replace(/^site-/, '');
    if (/^\d+$/.test(numericId)) return School.findByPk(Number(numericId));
    return School.findOne({ where: { uniqueSiteId: id } });
  }

  requireWriter(user) {
    if (!user || !['volunteer', 'admin'].includes(user.role)) {
      throw forbidden('Only volunteers and admins can write site records.');
    }
  }

  requireCanModify(user, school, options = {}) {
    if (!user) throw forbidden();
    if (user.role === 'admin') return;
    if (Number(user.id) !== Number(school.submittedByUserId)) throw forbidden();
    if (options.allowApprovedAdmin && school.status === 'approved') return;
  }

  canVolunteerEdit(user, school) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Number(user.id) === Number(school.submittedByUserId) && ['draft', 'rejected'].includes(school.status);
  }

  validateSitePayload(payload = {}, options = {}) {
    if (!options.final) return {};
    const fields = {};
    if (!readString(payload.name || payload.schoolName)) fields.name = 'School name is required';
    if (payload.urgencyLevel && !URGENCY.has(payload.urgencyLevel)) fields.urgencyLevel = 'Urgency level is invalid';
    return fields;
  }

  normalizeSchool(payload = {}) {
    const needs = Array.isArray(payload.needs) ? payload.needs.filter((need) => NEEDS.has(need)) : [];
    return clean({
      schoolName: maybeString(payload.name || payload.schoolName || payload.school_name),
      localName: maybeString(payload.localName || payload.local_name),
      schoolType: maybeString(payload.type || payload.schoolType || payload.school_type),
      operatorName: maybeString(payload.operatorName || payload.operator_name),
      phone: maybeString(payload.phone),
      urgency: URGENCY.has(payload.urgencyLevel || payload.urgency) ? (payload.urgencyLevel || payload.urgency) : 'low',
      needs,
    });
  }

  normalizeLocation(payload = {}) {
    return clean({
      latitude: numberOrNull(payload.latitude),
      longitude: numberOrNull(payload.longitude),
      country: maybeString(payload.country) || 'Nigeria',
      state: maybeString(payload.state),
      lga: maybeString(payload.lga),
      ward: maybeString(payload.ward),
      community: maybeString(payload.community),
      landmark: maybeString(payload.landmark),
      address: maybeString(payload.address || payload.landmark),
    });
  }

  normalizeChildren(payload = {}) {
    return clean({
      totalChildren: intOrNull(payload.totalChildren || payload.total_children),
      residentialChildren: intOrNull(payload.residentChildren || payload.residentialChildren || payload.residential_children),
      nonResidentialChildren: intOrNull(payload.nonResidentChildren || payload.nonResidentialChildren || payload.non_residential_children),
      boysCount: intOrNull(payload.boys || payload.boysCount || payload.boys_count),
      girlsCount: intOrNull(payload.girls || payload.girlsCount || payload.girls_count),
      age0to5: intOrNull(payload.age0to5),
      age6to9: intOrNull(payload.age6to9),
      age10to14: intOrNull(payload.age10to14),
      age15plus: intOrNull(payload.age15plus),
      ageGroups: Array.isArray(payload.ageGroups) ? payload.ageGroups : [],
      notes: maybeString(payload.notes),
      age35Count: intOrNull(payload.age0to5 || payload.age35Count || payload.age_3_5_count),
      age610Count: intOrNull(payload.age6to9 || payload.age610Count || payload.age_6_10_count),
      age1115Count: intOrNull(payload.age10to14 || payload.age1115Count || payload.age_11_15_count),
      age18PlusCount: intOrNull(payload.age15plus || payload.age18PlusCount || payload.age_18_plus_count),
    });
  }

  normalizeWelfare(payload = {}) {
    return clean({
      feedingStatus: maybeString(payload.feedingStatus),
      shelterStatus: maybeString(payload.shelterStatus),
      sanitationStatus: maybeString(payload.sanitationStatus),
      waterAccess: maybeString(payload.waterAccess),
      healthAccess: maybeString(payload.healthAccess),
      clothingStatus: maybeString(payload.clothingStatus),
      mealsPerDay: intOrNull(payload.mealsPerDay),
      waterSource: maybeString(payload.waterSource),
      hasToiletAccess: boolOrNull(payload.hasToiletAccess),
      hasAdequateClothing: boolOrNull(payload.hasAdequateClothing),
      hasHealthcareAccess: boolOrNull(payload.hasHealthcareAccess),
      sleepingArrangement: maybeString(payload.sleepingArrangement),
      hygieneCondition: maybeString(payload.hygieneCondition),
      safetyRisks: maybeString(payload.safetyRisks),
      immediateInterventionNeeded: Boolean(payload.immediateInterventionNeeded),
      urgencyReason: maybeString(payload.urgencyReason),
      followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
      notes: maybeString(payload.notes),
      hasCleanWater: payload.waterAccess ? null : boolOrNull(payload.hasCleanWater),
      hasSanitation: boolOrNull(payload.hasSanitation || payload.hasToiletAccess),
      hasHealthcare: boolOrNull(payload.hasHealthcare || payload.hasHealthcareAccess),
      hasClothingShelter: boolOrNull(payload.hasClothingShelter || payload.hasAdequateClothing),
      additionalNotes: maybeString(payload.notes || payload.additionalNotes),
    });
  }

  async applyPayload(school, payload = {}, user, transaction = null, options = {}) {
    const schoolPayload = this.normalizeSchool(payload);
    if (Object.keys(schoolPayload).length) await school.update(schoolPayload, { transaction });

    const operatorContacts = Array.isArray(payload.operatorContacts) ? payload.operatorContacts : [];
    const operators = operatorContacts.length
      ? operatorContacts
      : [{ name: payload.operatorName, phone: payload.phone }].filter((row) => readString(row.name) || readString(row.phone));
    if (operators.length) await this.replaceOperators(school.id, operators, transaction);

    await this.upsertOne(SchoolLocation, { schoolId: school.id }, this.normalizeLocation(payload), transaction);
    if (payload.populationSummary) {
      await this.upsertOne(SchoolChildrenStats, { schoolId: school.id }, this.normalizeChildren(payload.populationSummary), transaction);
    }
    if (payload.welfareAssessment) {
      await this.upsertOne(SchoolWelfareAssessment, { schoolId: school.id }, this.normalizeWelfare(payload.welfareAssessment), transaction);
    }
    if (options.includeLocalMedia && Array.isArray(payload.media)) {
      for (const media of payload.media) await this.createMediaFromPayload(school, user, media, transaction);
    }
  }

  async replaceOperators(schoolId, operators, transaction = null) {
    await SchoolOperator.destroy({ where: { schoolId }, transaction });
    const rows = operators
      .map((item) => ({ name: maybeString(item.name), phone: maybeString(item.phone) }))
      .filter((item) => item.name || item.phone);
    if (rows.length) await SchoolOperator.bulkCreate(rows.map((row) => ({ ...row, schoolId })), { transaction });
  }

  async upsertOne(Model, where, payload, transaction = null) {
    const data = clean(payload || {});
    if (!Object.keys(data).length) return null;
    const existing = await Model.findOne({ where, transaction });
    return existing
      ? existing.update(data, { transaction })
      : Model.create({ ...where, ...data }, { transaction });
  }

  async createMediaFromPayload(school, user, payload, transaction = null) {
    if (!payload.fileUrl && !payload.fileDataBase64) return null;
    const type = MEDIA_TYPES.has(payload.type) ? payload.type : 'other';
    const mimeType = maybeString(payload.mimeType);
    const mediaKind = MEDIA_KINDS.has(payload.mediaKind)
      ? payload.mediaKind
      : ((mimeType || '').startsWith('video/') ? 'video' : 'image');
    const fileUrl = payload.fileUrl || `https://cdn.example.com/sites/${this.siteId(school)}/${payload.id || `${type}.jpg`}`;
    return SchoolPhoto.create({
      schoolId: school.id,
      uploadedByUserId: user.id,
      clientId: maybeString(payload.id),
      fileUrl,
      localPath: maybeString(payload.localPath),
      mediaKind,
      mimeType,
      size: numberOrNull(payload.size),
      category: type,
      capturedAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      latitude: numberOrNull(payload.latitude),
      longitude: numberOrNull(payload.longitude),
    }, { transaction });
  }

  async ensureUniqueSiteId(school, payload, transaction) {
    const value = readString(payload.uniqueSiteId) || `SSA-${String(school.id).padStart(7, '0')}`;
    await school.update({ uniqueSiteId: value }, { transaction });
  }

  async createSubmissionNotification(school, user, transaction) {
    await AdminNotification.create({
      actorUserId: user.id,
      schoolId: school.id,
      type: 'school_submitted',
      title: 'New school submitted',
      message: `${user.name || 'A volunteer'} submitted ${school.schoolName || `Site #${school.id}`} for review.`,
      status: 'unread',
      metadata: { school_id: school.id, school_name: school.schoolName },
    }, { transaction });
  }

  async serializeSite(school) {
    const [operators, location, children, welfare, photos] = await Promise.all([
      SchoolOperator.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] }),
      SchoolLocation.findOne({ where: { schoolId: school.id } }),
      SchoolChildrenStats.findOne({ where: { schoolId: school.id } }),
      SchoolWelfareAssessment.findOne({ where: { schoolId: school.id } }),
      SchoolPhoto.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] }),
    ]);
    const primaryOperator = operators[0] || null;
    const loc = location || {};
    return {
      id: this.siteId(school),
      uniqueSiteId: school.uniqueSiteId || this.siteId(school),
      name: school.schoolName || '',
      localName: school.localName || null,
      type: school.schoolType || 'Learning Centre',
      operatorName: school.operatorName || (primaryOperator && primaryOperator.name) || '',
      phone: school.phone || (primaryOperator && primaryOperator.phone) || '',
      country: loc.country || 'Nigeria',
      state: loc.state || '',
      lga: loc.lga || '',
      ward: loc.ward || '',
      community: loc.community || '',
      landmark: loc.landmark || null,
      latitude: Number(loc.latitude || 0),
      longitude: Number(loc.longitude || 0),
      verificationStatus: this.verificationStatus(school.status),
      urgencyLevel: URGENCY.has(school.urgency) ? school.urgency : 'low',
      createdBy: String(school.submittedByUserId),
      createdAt: school.createdAt.toISOString(),
      updatedAt: school.updatedAt.toISOString(),
      populationSummary: this.serializeChildren(children),
      welfareAssessment: this.serializeWelfare(welfare),
      media: photos.map((photo) => this.serializeMedia(photo, school)),
      needs: Array.isArray(school.needs) ? school.needs : [],
      adminNotes: school.status === 'rejected' ? school.adminFeedback : null,
      reviewStatus: this.reviewStatus(school.status),
      correctionIssues: this.correctionIssues(school),
    };
  }

  serializeChildren(row) {
    if (!row) return null;
    return {
      totalChildren: Number(row.totalChildren || 0),
      residentChildren: Number(row.residentialChildren || 0),
      nonResidentChildren: Number(row.nonResidentialChildren || 0),
      age0to5: Number(row.age0to5 ?? row.age35Count ?? 0),
      age6to9: Number(row.age6to9 ?? row.age610Count ?? 0),
      age10to14: Number(row.age10to14 ?? row.age1115Count ?? 0),
      age15plus: Number(row.age15plus ?? row.age18PlusCount ?? 0),
      boys: Number(row.boysCount || 0),
      girls: Number(row.girlsCount || 0),
      ageGroups: Array.isArray(row.ageGroups) ? row.ageGroups : [],
      notes: row.notes || null,
    };
  }

  serializeWelfare(row) {
    if (!row) return null;
    return {
      feedingStatus: row.feedingStatus || 'Unknown',
      shelterStatus: row.shelterStatus || 'Unknown',
      sanitationStatus: row.sanitationStatus || 'Unknown',
      waterAccess: row.waterAccess || 'Unknown',
      healthAccess: row.healthAccess || 'Unknown',
      clothingStatus: row.clothingStatus || 'Unknown',
      mealsPerDay: row.mealsPerDay == null ? null : Number(row.mealsPerDay),
      waterSource: row.waterSource || null,
      hasToiletAccess: row.hasToiletAccess,
      hasAdequateClothing: row.hasAdequateClothing,
      hasHealthcareAccess: row.hasHealthcareAccess,
      sleepingArrangement: row.sleepingArrangement || null,
      hygieneCondition: row.hygieneCondition || null,
      safetyRisks: row.safetyRisks || null,
      immediateInterventionNeeded: Boolean(row.immediateInterventionNeeded),
      urgencyReason: row.urgencyReason || null,
      followUpDate: iso(row.followUpDate),
      notes: row.notes || null,
    };
  }

  serializeMedia(row, school) {
    return {
      id: row.clientId || `media-${row.id}`,
      siteId: this.siteId(school),
      fileUrl: row.fileUrl,
      localPath: row.localPath || null,
      mediaKind: row.mediaKind || 'image',
      mimeType: row.mimeType || null,
      size: row.size == null ? null : Number(row.size),
      type: row.category || 'other',
      timestamp: iso(row.capturedAt || row.createdAt) || new Date().toISOString(),
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
      uploadedBy: String(row.uploadedByUserId),
    };
  }

  async serializeDraft(school) {
    return {
      id: this.siteId(school),
      updatedAt: school.updatedAt.toISOString(),
      payload: await this.serializeSite(school),
      syncPending: false,
      currentStep: 0,
      totalSteps: 7,
    };
  }

  correctionIssues(school) {
    if (school.status !== 'rejected') return [];
    if (Array.isArray(school.correctionIssues) && school.correctionIssues.length) return school.correctionIssues;
    if (!school.adminFeedback) return [];
    return [{ fieldKey: 'landmark', stepIndex: 0, message: school.adminFeedback }];
  }

  draftPayload(payload = {}) {
    return payload.payload && typeof payload.payload === 'object' ? payload.payload : payload;
  }

  siteId(school) {
    return String(school.id);
  }

  verificationStatus(status) {
    if (status === 'approved') return 'verified';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  }

  reviewStatus(status) {
    if (status === 'approved') return 'approved';
    if (status === 'rejected') return 'needsCorrection';
    return 'pendingVerification';
  }

  statusFromVerification(status) {
    if (status === 'verified') return 'approved';
    if (status === 'rejected') return 'rejected';
    if (status === 'pending') return 'pending';
    return null;
  }

  csv(value) {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }
}

module.exports = new FlutterSchoolStore();
