process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.DB_LOGGING = 'false';

const http = require('node:http');
const express = require('express');
const path = require('path');

const bind_routes = require('@core/util/functions/bind_routes');
const { sequelize } = require('@core/util/classes/Model');
const AuthStore = require('@src/services/AuthStore');
const User = require('@src/models/User');
const School = require('@src/models/School');

function httpRequest(baseUrl, method, urlPath, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const payload = body == null ? null : JSON.stringify(body);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      headers: payload
        ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload), ...headers }
        : headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : null });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const sitePayload = (overrides = {}) => ({
  name: 'Sabon Gari Quranic School',
  localName: 'Makarantar Sabon Gari',
  type: 'Almajiri-style centre',
  operatorName: 'Malam Ibrahim Sani',
  phone: '+2348098765432',
  operatorContacts: [
    { name: 'Malam Ibrahim Sani', phone: '+2348098765432' },
    { name: 'Auwal Musa', phone: '+2348088887777' },
  ],
  country: 'Nigeria',
  state: 'Kano',
  lga: 'Fagge',
  ward: 'Sabon Gari',
  community: 'Kantin Kwari',
  landmark: 'Near central market',
  latitude: 12.0001,
  longitude: 8.5167,
  urgencyLevel: 'medium',
  populationSummary: {
    totalChildren: 43,
    residentChildren: 25,
    nonResidentChildren: 18,
    boys: 39,
    girls: 4,
    ageGroups: ['6-9', '10-14'],
    age0to5: 0,
    age6to9: 18,
    age10to14: 22,
    age15plus: 3,
    notes: 'Aggregate counts only.',
  },
  welfareAssessment: {
    feedingStatus: '2 meals per day',
    shelterStatus: 'Shared sleeping room',
    sanitationStatus: 'Functional toilet/latrine available',
    waterAccess: 'Borehole',
    healthAccess: 'Healthcare access available',
    clothingStatus: 'Adequate clothing',
    mealsPerDay: 2,
    waterSource: 'Borehole',
    hasToiletAccess: true,
    hasAdequateClothing: true,
    hasHealthcareAccess: true,
    sleepingArrangement: 'Shared sleeping room',
    hygieneCondition: 'Fair',
    safetyRisks: 'No immediate safety risks reported',
    immediateInterventionNeeded: false,
    urgencyReason: '',
    followUpDate: '2026-06-01T09:00:00.000Z',
    notes: 'Follow up during next field visit.',
  },
  needs: ['feeding', 'educationMaterials', 'healthOutreach'],
  media: [
    {
      id: 'media-pending-001',
      siteId: 'pending',
      fileUrl: null,
      localPath: '/local/path/photo.jpg',
      type: 'entrance',
      timestamp: '2026-05-01T10:00:00.000Z',
      latitude: 12.0001,
      longitude: 8.5167,
      uploadedBy: 'field-001',
    },
  ],
  ...overrides,
});

describe('flutter site contract routes', () => {
  let app;
  let server;
  let baseUrl;
  let volunteer;
  let helper;
  let admin;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    app = express();
    app.use(express.json());
    bind_routes(app, undefined, {
      controllers_base_dir: path.join(process.cwd(), 'src', 'controllers'),
      middlewares_base_dir: path.join(process.cwd(), 'src', 'middlewares'),
    });

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address();
    baseUrl = `http://${address.address}:${address.port}`;
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    volunteer = await AuthStore.createUser({
      name: 'Field Volunteer',
      username: 'field_volunteer',
      email: 'field@example.com',
      password: 'Password1!',
      role: 'volunteer',
    });
    helper = await AuthStore.createUser({
      name: 'Helper User',
      username: 'helper_user',
      email: 'helper@example.com',
      password: 'Password1!',
      role: 'helper',
    });
    admin = await AuthStore.createUser({
      name: 'Admin User',
      username: 'admin_user',
      email: 'admin@example.com',
      password: 'Password1!',
      role: 'admin',
    });
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });

  const auth = (token) => ({ authorization: `Bearer ${token}` });
  const volunteerAuth = () => auth(volunteer.accessToken);
  const helperAuth = () => auth(helper.accessToken);
  const adminAuth = () => auth(admin.accessToken);

  async function createSite(headers = volunteerAuth(), payload = sitePayload()) {
    return httpRequest(baseUrl, 'POST', '/sites', { headers, body: payload });
  }

  test('fresh database does not create a default admin on admin sign-in', async () => {
    await User.destroy({ where: { role: 'admin' } });

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: { email: 'admin@schoolsupportatlas.local', password: 'admin123' },
    });

    expect(res.status).toBe(401);
    expect(await User.findOne({ where: { email: 'admin@schoolsupportatlas.local' } })).toBeNull();
  });

  test('site CRUD creates, views, updates correction records, and protects unauthenticated access', async () => {
    const denied = await httpRequest(baseUrl, 'GET', '/sites');
    expect(denied.status).toBe(401);

    const created = await createSite();
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      name: 'Sabon Gari Quranic School',
      localName: 'Makarantar Sabon Gari',
      verificationStatus: 'pending',
      reviewStatus: 'pendingVerification',
      urgencyLevel: 'medium',
      populationSummary: { totalChildren: 43, age6to9: 18 },
      welfareAssessment: { feedingStatus: '2 meals per day', safetyRisks: 'No immediate safety risks reported' },
      media: [],
      needs: ['feeding', 'educationMaterials', 'healthOutreach'],
    });
    expect(typeof created.body.id).toBe('string');

    const submitted = await httpRequest(baseUrl, 'GET', `/users/${volunteer.user.id}/submitted-sites`, {
      headers: volunteerAuth(),
    });
    expect(submitted.status).toBe(200);
    expect(submitted.body.total).toBe(1);
    expect(submitted.body.items[0].reviewStatus).toBe('pendingVerification');

    await School.update({
      status: 'rejected',
      adminFeedback: 'Add a clearer nearby landmark for verification.',
      correctionIssues: [{ fieldKey: 'landmark', stepIndex: 0, message: 'Add a clearer nearby landmark for verification.' }],
    }, { where: { id: Number(created.body.id) } });

    const correction = await httpRequest(baseUrl, 'PUT', `/sites/${created.body.id}?correctionOnly=true`, {
      headers: volunteerAuth(),
      body: sitePayload({ landmark: 'Near Kantin Kwari market main gate' }),
    });
    expect(correction.status).toBe(200);
    expect(correction.body).toMatchObject({
      landmark: 'Near Kantin Kwari market main gate',
      verificationStatus: 'pending',
      reviewStatus: 'pendingVerification',
      adminNotes: null,
      correctionIssues: [],
    });

    const deletable = await createSite(volunteerAuth(), sitePayload({ name: 'Rejected Delete Candidate' }));
    await School.update({ status: 'rejected', adminFeedback: 'Duplicate record.' }, {
      where: { id: Number(deletable.body.id) },
    });
    const deleted = await httpRequest(baseUrl, 'DELETE', `/sites/${deletable.body.id}`, {
      headers: volunteerAuth(),
    });
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ deleted: true });
  });

  test('helpers read verified sites while pending sites stay hidden', async () => {
    const created = await createSite();

    const hiddenList = await httpRequest(baseUrl, 'GET', '/sites', { headers: helperAuth() });
    expect(hiddenList.status).toBe(200);
    expect(hiddenList.body.total).toBe(0);

    await School.update({ status: 'approved', approvedByUserId: admin.user.id, reviewedAt: new Date() }, {
      where: { id: Number(created.body.id) },
    });

    const list = await httpRequest(baseUrl, 'GET', '/sites?verificationStatus=verified&urgencyLevel=medium&need=feeding', {
      headers: helperAuth(),
    });
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({
      id: created.body.id,
      verificationStatus: 'verified',
      reviewStatus: 'approved',
    });

    const detail = await httpRequest(baseUrl, 'GET', `/sites/${created.body.id}`, { headers: helperAuth() });
    expect(detail.status).toBe(200);
    expect(detail.body.id).toBe(created.body.id);
  });

  test('media upload, assessment submit, dashboard summary, and export match Flutter shapes', async () => {
    const pending = await createSite();
    const approved = await createSite(volunteerAuth(), sitePayload({
      name: 'Approved Centre',
      urgencyLevel: 'high',
      populationSummary: { ...sitePayload().populationSummary, totalChildren: 10 },
    }));
    await School.update({ status: 'approved', approvedByUserId: admin.user.id, reviewedAt: new Date() }, {
      where: { id: Number(approved.body.id) },
    });

    const media = await httpRequest(baseUrl, 'POST', `/sites/${pending.body.id}/media`, {
      headers: volunteerAuth(),
      body: {
        id: 'media-001',
        fileName: 'entrance.jpg',
        contentType: 'image/jpeg',
        fileDataBase64: '/9j/4AAQSkZJRgABAQAAAQABAAD...',
        type: 'entrance',
        timestamp: '2026-05-01T10:00:00.000Z',
        latitude: 12.0001,
        longitude: 8.5167,
      },
    });
    expect(media.status).toBe(201);
    expect(media.body).toMatchObject({
      id: 'media-001',
      siteId: pending.body.id,
      type: 'entrance',
      uploadedBy: String(volunteer.user.id),
    });
    expect(media.body.fileUrl).toContain('/sites/');

    const assessment = await httpRequest(baseUrl, 'POST', `/sites/${pending.body.id}/assessment`, {
      headers: volunteerAuth(),
      body: sitePayload().welfareAssessment,
    });
    expect(assessment.status).toBe(201);
    expect(assessment.body).toMatchObject({
      feedingStatus: '2 meals per day',
      immediateInterventionNeeded: false,
    });

    const summary = await httpRequest(baseUrl, 'GET', '/dashboard/summary', { headers: volunteerAuth() });
    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({
      totalSites: 2,
      estimatedChildren: 53,
      pendingVerification: 1,
      verifiedSites: 1,
      highUrgencySites: 1,
    });

    const exported = await httpRequest(baseUrl, 'GET', '/exports/sites?format=csv', { headers: adminAuth() });
    expect(exported.status).toBe(200);
    expect(exported.body.contentType).toBe('text/csv');
    expect(exported.body.data).toContain('uniqueSiteId,name,state,lga,community,verificationStatus,urgencyLevel,estimatedChildren');
    expect(exported.body.data).toContain('Approved Centre');
  });

  test('backend drafts can be created, listed, updated, submitted, and deleted', async () => {
    const created = await httpRequest(baseUrl, 'POST', '/sites/drafts', {
      headers: volunteerAuth(),
      body: sitePayload({ name: 'Draft Centre' }),
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      payload: { name: 'Draft Centre', reviewStatus: 'pendingVerification' },
      syncPending: false,
    });

    const list = await httpRequest(baseUrl, 'GET', '/sites/drafts', { headers: volunteerAuth() });
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);

    const shown = await httpRequest(baseUrl, 'GET', `/sites/drafts/${created.body.id}`, { headers: volunteerAuth() });
    expect(shown.status).toBe(200);
    expect(shown.body.payload.name).toBe('Draft Centre');

    const updated = await httpRequest(baseUrl, 'PUT', `/sites/drafts/${created.body.id}`, {
      headers: volunteerAuth(),
      body: sitePayload({ name: 'Updated Draft Centre' }),
    });
    expect(updated.status).toBe(200);
    expect(updated.body.payload.name).toBe('Updated Draft Centre');

    const submitted = await httpRequest(baseUrl, 'POST', `/sites/drafts/${created.body.id}/submit`, {
      headers: volunteerAuth(),
    });
    expect(submitted.status).toBe(200);
    expect(submitted.body).toMatchObject({
      name: 'Updated Draft Centre',
      verificationStatus: 'pending',
      reviewStatus: 'pendingVerification',
    });

    const toDelete = await httpRequest(baseUrl, 'POST', '/sites/drafts', {
      headers: volunteerAuth(),
      body: sitePayload({ name: 'Delete Draft' }),
    });
    const deleted = await httpRequest(baseUrl, 'DELETE', `/sites/drafts/${toDelete.body.id}`, {
      headers: volunteerAuth(),
    });
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ deleted: true });
  });

  test('locations endpoint is public and returns Nigeria state/LGA data', async () => {
    const res = await httpRequest(baseUrl, 'GET', '/locations/nigeria/states-lgas');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('lgas');
  });

  test('authorization blocks helper writes and cross-user submitted-site access', async () => {
    const helperWrite = await createSite(helperAuth());
    expect(helperWrite.status).toBe(403);

    const otherVolunteer = await AuthStore.createUser({
      name: 'Other Volunteer',
      username: 'other_volunteer',
      email: 'other@example.com',
      password: 'Password1!',
      role: 'volunteer',
    });
    const crossUser = await httpRequest(baseUrl, 'GET', `/users/${volunteer.user.id}/submitted-sites`, {
      headers: auth(otherVolunteer.accessToken),
    });
    expect(crossUser.status).toBe(403);
  });
});
