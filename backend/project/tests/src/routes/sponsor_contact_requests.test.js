process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
process.env.DB_LOGGING = 'false';
process.env.EMAIL_TRANSPORT = 'fake';
process.env.ADMIN_NOTIFICATION_EMAIL = 'contact@schoolsupportatlas.com';
process.env.ADMIN_EMAIL = 'admin@schoolsupportatlas.local';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.ADMIN_NAME = 'System Admin';
jest.setTimeout(60000);

const http = require('node:http');
const express = require('express');
const path = require('path');

const bind_routes = require('@core/util/functions/bind_routes');
const { sequelize } = require('@core/util/classes/Model');
const AuthStore = require('@src/services/AuthStore');
const EmailJob = require('@src/jobs/EmailJob');

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
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (_) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function sponsorPayload(overrides = {}) {
  return {
    sponsorName: 'Amina Bello',
    sponsorEmail: 'amina@example.com',
    sponsorPhone: '+2348012345678',
    sponsorCountry: 'Nigeria',
    organizationName: 'Bello Foundation',
    preferredHelpType: 'Send Items',
    pledgeAmount: '',
    helpDetails: 'We can deliver 25 writing packs this month.',
    message: 'Please connect us with the admin team for coordination.',
    schoolId: 'kano-al-falah',
    schoolName: 'Al-Falah Madrasa and Basic School',
    selectedNeeds: [
      {
        id: 'need-kano-water',
        title: 'Safe water storage',
        category: 'Water',
        estimatedCost: 850000,
      },
    ],
    profileLink: 'https://schoolsupportatlas.com/schools/kano-al-falah',
    ...overrides,
  };
}

describe('contact and sponsor request routes', () => {
  let app;
  let server;
  let baseUrl;

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
    EmailJob.resetFakeDeliveries();
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });

  async function signInAdmin() {
    await AuthStore.createUser({
      name: 'System Admin',
      email: 'admin@schoolsupportatlas.local',
      password: 'admin123',
      role: 'admin',
    });
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: { email: 'admin@schoolsupportatlas.local', password: 'admin123' },
    });
    return res.body.data.access_token;
  }

  test('contact request validates input and sends an email without storing data', async () => {
    const invalid = await httpRequest(baseUrl, 'POST', '/contact-requests', {
      body: { name: '', email: 'bad', subject: '', message: '' },
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.error.fields).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      subject: expect.any(String),
      message: expect.any(String),
    });

    const valid = await httpRequest(baseUrl, 'POST', '/contact-requests', {
      body: {
        name: 'Fatima Musa',
        email: 'fatima@example.com',
        subject: 'School verification',
        message: 'Please help us verify a school in Kano.',
      },
    });
    expect(valid.status).toBe(201);
    expect(valid.body.data.sent).toBe(true);
    expect(EmailJob.fakeDeliveries()).toHaveLength(1);
    expect(EmailJob.fakeDeliveries()[0]).toMatchObject({
      to: 'contact@schoolsupportatlas.com',
      subject: 'Contact form: School verification',
    });
  });

  test('sponsor request can be submitted publicly and creates admin data', async () => {
    const created = await httpRequest(baseUrl, 'POST', '/sponsor-requests', {
      body: sponsorPayload(),
    });
    expect(created.status).toBe(201);
    expect(created.body.data.sponsorRequest).toMatchObject({
      sponsorName: 'Amina Bello',
      sponsorEmail: 'amina@example.com',
      sponsorPhone: '+2348012345678',
      schoolId: 'kano-al-falah',
      schoolName: 'Al-Falah Madrasa and Basic School',
      status: 'new',
    });
    expect(created.body.data.sponsorRequest.selectedNeeds[0]).toMatchObject({
      id: 'need-kano-water',
      title: 'Safe water storage',
    });
    expect(EmailJob.fakeDeliveries()).toHaveLength(1);
    expect(EmailJob.fakeDeliveries()[0].subject).toBe('New sponsor request for Al-Falah Madrasa and Basic School');

    const blocked = await httpRequest(baseUrl, 'GET', '/admin/sponsor-requests');
    expect(blocked.status).toBe(401);

    const adminToken = await signInAdmin();
    const auth = { authorization: `Bearer ${adminToken}` };

    const listed = await httpRequest(baseUrl, 'GET', '/admin/sponsor-requests', { headers: auth });
    expect(listed.status).toBe(200);
    expect(listed.body.data.items).toHaveLength(1);
    expect(listed.body.data.items[0].requestId).toMatch(/^sponsor-request-/);

    const notifications = await httpRequest(baseUrl, 'GET', '/admin/notifications?type=sponsor_request_received', { headers: auth });
    expect(notifications.status).toBe(200);
    expect(notifications.body.data.items).toHaveLength(1);
    expect(notifications.body.data.items[0].status).toBe('unread');

    const id = listed.body.data.items[0].id;
    const shown = await httpRequest(baseUrl, 'GET', `/admin/sponsor-requests/${id}`, { headers: auth });
    expect(shown.status).toBe(200);
    expect(shown.body.data.sponsorRequest.id).toBe(id);

    const updated = await httpRequest(baseUrl, 'PATCH', `/admin/sponsor-requests/${id}/status`, {
      headers: auth,
      body: { status: 'contacted' },
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.sponsorRequest.status).toBe('contacted');

    const contacted = await httpRequest(baseUrl, 'GET', '/admin/sponsor-requests?status=contacted', { headers: auth });
    expect(contacted.body.data.items).toHaveLength(1);
    expect(contacted.body.data.items[0].status).toBe('contacted');
  });
});
