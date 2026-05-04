process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
process.env.DB_LOGGING = 'false';
process.env.ADMIN_EMAIL = 'admin@schoolsupportatlas.local';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.ADMIN_NAME = 'System Admin';
jest.setTimeout(60000);

const http = require('node:http');
const express = require('express');
const path = require('path');
const fs = require('fs');

process.env.STORAGE_LOCAL_ROOT = path.join(__dirname, '..', '..', '..', '.tmp', 'uploads-volunteer-test');

const bind_routes = require('@core/util/functions/bind_routes');
const { sequelize } = require('@core/util/classes/Model');
const FileStorage = require('@src/services/FileStorage');
const AuthStore = require('@src/services/AuthStore');

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

function multipartBody({ fields = {}, files = [] }) {
  const boundary = `----ssa-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const chunks = [];
  const push = (value) => chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value)));

  for (const [name, value] of Object.entries(fields)) {
    push(`--${boundary}\r\n`);
    push(`Content-Disposition: form-data; name="${name}"\r\n\r\n`);
    push(`${value}\r\n`);
  }

  for (const file of files) {
    push(`--${boundary}\r\n`);
    push(`Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\n`);
    push(`Content-Type: ${file.contentType}\r\n\r\n`);
    push(file.content);
    push('\r\n');
  }

  push(`--${boundary}--\r\n`);
  return { boundary, body: Buffer.concat(chunks) };
}

function httpMultipartRequest(baseUrl, method, urlPath, { headers = {}, fields = {}, files = [] } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const { boundary, body } = multipartBody({ fields, files });
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + (url.search || ''),
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': body.length,
        ...headers,
      },
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
    req.write(body);
    req.end();
  });
}

describe('volunteer and admin routes', () => {
  let app;
  let server;
  let baseUrl;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    fs.rmSync(FileStorage.uploadRoot(), { recursive: true, force: true });
    app = express();
    app.use(express.json());
    app.use('/uploads', express.static(FileStorage.uploadRoot()));
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
    fs.rmSync(FileStorage.uploadRoot(), { recursive: true, force: true });
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });

  async function signUpVolunteer() {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: { name: 'Volunteer One', email: 'volunteer@example.com', password: 'secret123' },
    });
    return res.body.data.access_token;
  }

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

  test('volunteer can open dashboard and submit schools without a forced complete-profile step', async () => {
    const token = await signUpVolunteer();
    const auth = { authorization: `Bearer ${token}` };

    const dashboard = await httpRequest(baseUrl, 'GET', '/volunteer/dashboard', { headers: auth });
    expect(dashboard.status).toBe(200);

    const profile = await httpRequest(baseUrl, 'PUT', '/volunteer/profile', {
      headers: auth,
      body: {
        full_name: 'Volunteer One',
        phone: '+2348012345678',
        address: 'Near central mosque',
      },
    });
    expect(profile.status).toBe(200);
    expect(profile.body.data.profile_completed).toBe(true);

    const school = await httpRequest(baseUrl, 'POST', '/volunteer/schools', {
      headers: auth,
      body: {
        school: {
          school_name: 'Al-Huda Quranic School',
          school_type: 'traditional_quranic_school',
          urgency: 'high',
        },
        operators: [{ name: 'Mallam Musa', phone: '+2348012345678' }],
      },
    });
    expect(school.status).toBe(201);
    expect(school.body.data.school.status).toBe('pending');
  });

  test('admin can see notifications, volunteer schools, and approve a submitted school', async () => {
    const volunteerToken = await signUpVolunteer();
    const volunteerAuth = { authorization: `Bearer ${volunteerToken}` };
    await httpRequest(baseUrl, 'PUT', '/volunteer/profile', {
      headers: volunteerAuth,
      body: {
        full_name: 'Volunteer One',
        phone: '+2348012345678',
        state: 'Kano',
        lga: 'Nasarawa',
        address: 'Near central mosque',
      },
    });
    const school = await httpRequest(baseUrl, 'POST', '/volunteer/schools', {
      headers: volunteerAuth,
      body: {
        school: {
          school_name: 'Al-Huda Quranic School',
          school_type: 'traditional_quranic_school',
        },
      },
    });
    const schoolId = school.body.data.school.id;

    const adminToken = await signInAdmin();
    const adminAuth = { authorization: `Bearer ${adminToken}` };

    const notifications = await httpRequest(baseUrl, 'GET', '/admin/notifications', { headers: adminAuth });
    expect(notifications.status).toBe(200);
    expect(notifications.body.data.items).toHaveLength(1);

    const volunteers = await httpRequest(baseUrl, 'GET', '/admin/volunteers', { headers: adminAuth });
    const volunteerId = volunteers.body.data.items[0].id;
    const volunteerSchools = await httpRequest(baseUrl, 'GET', `/admin/volunteers/${volunteerId}/schools`, { headers: adminAuth });
    expect(volunteerSchools.body.data.items[0].id).toBe(schoolId);

    const approved = await httpRequest(baseUrl, 'POST', `/admin/schools/${schoolId}/approve`, {
      headers: adminAuth,
      body: { comment: 'Verified and approved.' },
    });
    expect(approved.status).toBe(200);
    expect(approved.body.data.school.status).toBe('approved');

    const volunteerNotifications = await httpRequest(baseUrl, 'GET', '/volunteer/notifications', { headers: volunteerAuth });
    expect(volunteerNotifications.status).toBe(200);
    expect(volunteerNotifications.body.data.items).toHaveLength(1);
    expect(volunteerNotifications.body.data.items[0].type).toBe('school_approved');
    expect(volunteerNotifications.body.data.items[0].status).toBe('unread');

    const read = await httpRequest(baseUrl, 'POST', `/volunteer/notifications/${volunteerNotifications.body.data.items[0].id}/read`, { headers: volunteerAuth });
    expect(read.status).toBe(200);
    expect(read.body.data.notification.status).toBe('read');

    const publicSchool = await httpRequest(baseUrl, 'GET', `/schools/${schoolId}`, { headers: adminAuth });
    expect(publicSchool.status).toBe(200);
    expect(publicSchool.body.data.school.id).toBe(schoolId);
  });

  test('admin token cannot access volunteer app routes', async () => {
    const adminToken = await signInAdmin();
    const res = await httpRequest(baseUrl, 'GET', '/volunteer/profile', {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(403);
  });

  test('volunteer school photo endpoint accepts multipart uploads', async () => {
    const token = await signUpVolunteer();
    const auth = { authorization: `Bearer ${token}` };
    await httpRequest(baseUrl, 'PUT', '/volunteer/profile', {
      headers: auth,
      body: {
        full_name: 'Volunteer One',
        phone: '+2348012345678',
        state: 'Kano',
        lga: 'Nasarawa',
        address: 'Near central mosque',
      },
    });

    const draft = await httpRequest(baseUrl, 'POST', '/volunteer/schools/drafts', {
      headers: auth,
      body: {
        school: {
          school_name: 'Draft Quranic School',
          school_type: 'traditional_quranic_school',
        },
      },
    });
    expect(draft.status).toBe(201);
    const schoolId = draft.body.data.school.id;

    const uploaded = await httpMultipartRequest(baseUrl, 'POST', `/volunteer/schools/${schoolId}/photos`, {
      headers: auth,
      fields: {
        category: 'entrance',
        caption: 'School entrance',
      },
      files: [{
        name: 'photo',
        filename: 'entrance.jpg',
        contentType: 'image/jpeg',
        content: Buffer.from('volunteer-school-image'),
      }],
    });
    expect(uploaded.status).toBe(201);
    expect(uploaded.body.data.items[0]).toMatchObject({
      school_id: schoolId,
      file_url: expect.stringMatching(/^http:\/\/.+\/uploads\/schools\/\d+\/entrance-/),
      local_path: expect.stringMatching(/^uploads\/schools\/\d+\/entrance-/),
      category: 'entrance',
      caption: 'School entrance',
    });

    const imagePath = new URL(uploaded.body.data.items[0].file_url).pathname;
    const image = await httpRequest(baseUrl, 'GET', imagePath);
    expect(image.status).toBe(200);
    expect(image.body).toBe('volunteer-school-image');
  });
});
