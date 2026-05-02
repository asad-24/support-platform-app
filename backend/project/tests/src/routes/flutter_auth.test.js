process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.DB_LOGGING = 'false';
process.env.ADMIN_EMAIL = 'admin@schoolsupportatlas.local';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.ADMIN_NAME = 'System Admin';

const http = require('node:http');
const express = require('express');
const path = require('path');

const bind_routes = require('@core/util/functions/bind_routes');
const { sequelize } = require('@core/util/classes/Model');
const AuthStore = require('@src/services/AuthStore');
const User = require('@src/models/User');
const VolunteerApplication = require('@src/models/VolunteerApplication');

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

function volunteerApplicationBody(overrides = {}) {
  return {
    fullName: 'Ibrahim Sule',
    email: 'ibrahim.sule@example.com',
    phone: '+2348012345678',
    dateOfBirth: '1994-05-14',
    gender: 'Male',
    state: 'Kano',
    lga: 'Nassarawa',
    address: 'Nassarawa LGA, Kano State',
    educationLevel: 'Tertiary',
    occupation: 'Community volunteer',
    skills: 'Community outreach, data collection',
    volunteerExperience: 'Two years supporting school mapping.',
    availability: 'Weekends',
    volunteeringMode: 'Field visits',
    motivation: 'Improve support visibility.',
    emergencyContactName: 'Amina Sule',
    emergencyContactPhone: '+2348091112233',
    ...overrides,
  };
}

describe('flutter auth contract routes', () => {
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
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  });

  test('helper signup creates a helper account and username availability reflects it', async () => {
    const available = await httpRequest(baseUrl, 'GET', '/auth/username-available?username=helper_user');
    expect(available.status).toBe(200);
    expect(available.body).toEqual({ username: 'helper_user', available: true });

    const signup = await httpRequest(baseUrl, 'POST', '/auth/signup', {
      body: {
        username: 'helper_user',
        email: 'helper@example.com',
        password: 'Password1!',
        accessRole: 'helper',
      },
    });

    expect(signup.status).toBe(201);
    expect(signup.body).toMatchObject({
      accessRole: 'helper',
      user: {
        email: 'helper@example.com',
        username: 'helper_user',
        role: 'fieldWorker',
        profileComplete: true,
        permissions: ['sites:read', 'support:offer'],
      },
    });
    expect(typeof signup.body.accessToken).toBe('string');
    expect(typeof signup.body.refreshToken).toBe('string');

    const unavailable = await httpRequest(baseUrl, 'GET', '/auth/username-available?username=helper_user');
    expect(unavailable.body.available).toBe(false);
  });

  test('volunteer self signup is disabled on the flutter signup endpoint', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/signup', {
      body: {
        username: 'volunteer_user',
        email: 'volunteer@example.com',
        password: 'Password1!',
        accessRole: 'volunteer',
      },
    });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('VOLUNTEER_SIGNUP_DISABLED');
  });

  test('volunteer can login by username and use users/me profile endpoints', async () => {
    await AuthStore.createUser({
      name: 'Ibrahim Sule',
      username: 'ibrahim',
      email: 'ibrahim@example.com',
      password: 'Password1!',
      role: 'volunteer',
    });

    const login = await httpRequest(baseUrl, 'POST', '/auth/login', {
      body: {
        identifier: 'ibrahim',
        password: 'Password1!',
        accessRole: 'volunteer',
      },
    });

    expect(login.status).toBe(200);
    expect(login.body).toMatchObject({
      accessRole: 'volunteer',
      user: {
        name: 'Ibrahim Sule',
        email: 'ibrahim@example.com',
        username: 'ibrahim',
        role: 'fieldWorker',
        profileComplete: false,
      },
    });

    const auth = { authorization: `Bearer ${login.body.accessToken}` };
    const updated = await httpRequest(baseUrl, 'PATCH', '/users/me/volunteer-profile', {
      headers: auth,
      body: {
        phone: '+2348012345678',
        state: 'Kano',
        lga: 'Nassarawa',
        address: 'Nassarawa LGA, Kano State',
        educationLevel: 'Tertiary',
        occupation: 'Community volunteer',
      },
    });

    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({
      name: 'Ibrahim Sule',
      email: 'ibrahim@example.com',
      phone: '+2348012345678',
      state: 'Kano',
      lga: 'Nassarawa',
      address: 'Nassarawa LGA, Kano State',
      educationLevel: 'Tertiary',
      occupation: 'Community volunteer',
      profileComplete: true,
    });

    const me = await httpRequest(baseUrl, 'GET', '/users/me', { headers: auth });
    expect(me.status).toBe(200);
    expect(me.body.profileComplete).toBe(true);
    expect(me.body.permissions).toEqual(['sites:create', 'sites:update:assigned']);
  });

  test('refresh rotates tokens, logout clears them, and change password validates current password', async () => {
    const signup = await httpRequest(baseUrl, 'POST', '/auth/signup', {
      body: {
        username: 'helper_user',
        email: 'helper@example.com',
        password: 'Password1!',
        accessRole: 'helper',
      },
    });

    const refresh = await httpRequest(baseUrl, 'POST', '/auth/refresh', {
      body: { refreshToken: signup.body.refreshToken },
    });
    expect(refresh.status).toBe(200);
    expect(refresh.body.accessToken).not.toBe(signup.body.accessToken);
    expect(refresh.body.refreshToken).not.toBe(signup.body.refreshToken);

    const badChange = await httpRequest(baseUrl, 'POST', '/auth/change-password', {
      headers: { authorization: `Bearer ${refresh.body.accessToken}` },
      body: {
        currentPassword: 'wrong',
        newPassword: 'Atlas2026#',
      },
    });
    expect(badChange.status).toBe(401);
    expect(badChange.body.error.code).toBe('INVALID_CURRENT_PASSWORD');

    const changed = await httpRequest(baseUrl, 'POST', '/auth/change-password', {
      headers: { authorization: `Bearer ${refresh.body.accessToken}` },
      body: {
        currentPassword: 'Password1!',
        newPassword: 'Atlas2026#',
      },
    });
    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ success: true, message: 'Password changed.' });

    const logout = await httpRequest(baseUrl, 'POST', '/auth/logout', {
      headers: { authorization: `Bearer ${refresh.body.accessToken}` },
      body: { refreshToken: refresh.body.refreshToken },
    });
    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({ success: true });

    const denied = await httpRequest(baseUrl, 'GET', '/users/me', {
      headers: { authorization: `Bearer ${refresh.body.accessToken}` },
    });
    expect(denied.status).toBe(401);
  });

  test('volunteer applications are pending records and do not create users', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/volunteer-applications', {
      body: volunteerApplicationBody(),
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: 'pending',
      message: 'Your registration request is pending admin review.',
    });
    expect(res.body.requestId).toMatch(/^volunteer-request-/);

    const application = await VolunteerApplication.findOne({ where: { email: 'ibrahim.sule@example.com' } });
    expect(application).not.toBeNull();

    const user = await User.findOne({ where: { email: 'ibrahim.sule@example.com' } });
    expect(user).toBeNull();
  });

  test('volunteer applications return validation errors and reject duplicate pending emails', async () => {
    const invalid = await httpRequest(baseUrl, 'POST', '/volunteer-applications', {
      body: volunteerApplicationBody({ email: 'not-an-email', phone: '' }),
    });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      fields: {
        email: 'Enter a valid email address',
        phone: 'This field is required',
      },
    });

    await httpRequest(baseUrl, 'POST', '/volunteer-applications', {
      body: volunteerApplicationBody(),
    });
    const duplicate = await httpRequest(baseUrl, 'POST', '/volunteer-applications', {
      body: volunteerApplicationBody(),
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('APPLICATION_EXISTS');
  });
});
