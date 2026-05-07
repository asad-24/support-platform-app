process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
process.env.DB_LOGGING = 'false';
process.env.ADMIN_EMAIL = 'admin@schoolsupportatlas.local';
process.env.ADMIN_PASSWORD = 'admin123';
process.env.ADMIN_NAME = 'System Admin';
jest.setTimeout(60000);

const http = require('node:http');
const express = require('express');
const path = require('path');

const bind_routes = require('@core/util/functions/bind_routes');
const User = require('@src/models/User');
const AuthStore = require('@src/services/AuthStore');
const { sequelize } = require('@core/util/classes/Model');

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
        ? {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(payload),
            ...headers,
          }
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

const DEFAULT_ADMIN_EMAIL = 'admin@schoolsupportatlas.local';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

function cookieHeader(setCookie = []) {
  return (Array.isArray(setCookie) ? setCookie : [setCookie])
    .filter(Boolean)
    .map((value) => String(value).split(';')[0])
    .join('; ');
}

describe('auth routes', () => {
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

  test('POST /auth/sign-up creates a volunteer user and returns an access token', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        token_type: 'Bearer',
        user: {
          id: 1,
          name: 'Areeba',
          email: 'areeba@example.com',
          role: 'volunteer',
        },
      },
    });
    expect(typeof res.body.data.access_token).toBe('string');
    expect(res.body.data.access_token.length).toBeGreaterThan(20);
  });

  test('POST /auth/sign-up accepts volunteer role explicitly', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Sara',
        email: 'sara@example.com',
        role: 'volunteer',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Sara',
          email: 'sara@example.com',
          role: 'volunteer',
        },
      },
    });
  });

  test('POST /auth/sign-up rejects duplicate email addresses', async () => {
    await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Another User',
        email: 'Areeba@example.com',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Email already registered',
    });
  });

  test('POST /auth/sign-up rejects invalid roles', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        role: 'teacher',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Role must be admin or volunteer',
    });
  });

  test('POST /auth/sign-up does not allow admin accounts', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Admin User',
        email: 'admin2@example.com',
        role: 'admin',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Public sign-up is only available for volunteers',
    });
  });

  test('POST /auth/sign-in returns a fresh access token for a volunteer', async () => {
    await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: {
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        token_type: 'Bearer',
        user: {
          email: 'areeba@example.com',
          role: 'volunteer',
        },
      },
    });
    expect(typeof res.body.data.access_token).toBe('string');
  });

  test('POST /auth/sign-in does not create a default admin account', async () => {
    const admin = await User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
    expect(admin).toBeNull();

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      },
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, error: 'Invalid email or password' });

    const storedAdmin = await User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
    expect(storedAdmin).toBeNull();
  });

  test('POST /auth/sign-in accepts the typo volumtier and stores volunteer', async () => {
    await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Sara',
        email: 'sara@example.com',
        role: 'volumtier',
        password: 'secret123',
      },
    });

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: {
        email: 'sara@example.com',
        role: 'volumtier',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: 'sara@example.com',
          role: 'volunteer',
        },
      },
    });
  });

  test('POST /auth/sign-in rejects invalid credentials or mismatched role', async () => {
    await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: {
        email: 'areeba@example.com',
        role: 'volunteer',
        password: 'wrong-password',
      },
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Invalid email or password',
    });
  });

  test('GET /auth/me requires a valid bearer token', async () => {
    const signUp = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Areeba',
        email: 'areeba@example.com',
        password: 'secret123',
      },
    });

    const denied = await httpRequest(baseUrl, 'GET', '/auth/me');
    expect(denied.status).toBe(401);
    expect(denied.body).toMatchObject({
      success: false,
      error: 'Access token is required',
    });

    const allowed = await httpRequest(baseUrl, 'GET', '/auth/me', {
      headers: {
        authorization: `Bearer ${signUp.body.data.access_token}`,
      },
    });

    expect(allowed.status).toBe(200);
    expect(allowed.body).toMatchObject({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Areeba',
          email: 'areeba@example.com',
          role: 'volunteer',
        },
      },
    });
  });

  test('POST /auth/admin/users lets an admin create admin or volunteer users', async () => {
    await AuthStore.createUser({
      name: 'System Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
    });

    const signIn = await httpRequest(baseUrl, 'POST', '/auth/sign-in', {
      body: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      },
    });

    const adminCreate = await httpRequest(baseUrl, 'POST', '/auth/admin/users', {
      headers: {
        authorization: `Bearer ${signIn.body.data.access_token}`,
      },
      body: {
        name: 'Second Admin',
        email: 'second-admin@example.com',
        role: 'admin',
        password: 'secret123',
      },
    });

    const volunteerCreate = await httpRequest(baseUrl, 'POST', '/auth/admin/users', {
      headers: {
        authorization: `Bearer ${signIn.body.data.access_token}`,
      },
      body: {
        name: 'New Volunteer',
        email: 'new-volunteer@example.com',
        role: 'volunteer',
        password: 'secret123',
      },
    });

    expect(adminCreate.status).toBe(201);
    expect(adminCreate.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: 'second-admin@example.com',
          role: 'admin',
        },
      },
    });

    expect(volunteerCreate.status).toBe(201);
    expect(volunteerCreate.body).toMatchObject({
      success: true,
      data: {
        user: {
          email: 'new-volunteer@example.com',
          role: 'volunteer',
        },
      },
    });
  });

  test('POST /auth/sign-up stores the registered user in the database', async () => {
    const res = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Stored User',
        email: 'stored@example.com',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(201);

    const storedUser = await User.findOne({ where: { email: 'stored@example.com' } });
    expect(storedUser).not.toBeNull();
    expect(storedUser.name).toBe('Stored User');
    expect(storedUser.role).toBe('volunteer');
    expect(typeof storedUser.passwordHash).toBe('string');
    expect(storedUser.passwordHash.length).toBeGreaterThan(20);
    expect(storedUser.accessToken).toBe(res.body.data.access_token);
  });

  test('POST /auth/admin/users rejects volunteer tokens', async () => {
    const signUp = await httpRequest(baseUrl, 'POST', '/auth/sign-up', {
      body: {
        name: 'Volunteer User',
        email: 'volunteer@example.com',
        password: 'secret123',
      },
    });

    const res = await httpRequest(baseUrl, 'POST', '/auth/admin/users', {
      headers: {
        authorization: `Bearer ${signUp.body.data.access_token}`,
      },
      body: {
        name: 'Blocked Admin',
        email: 'blocked-admin@example.com',
        role: 'admin',
        password: 'secret123',
      },
    });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Admin access is required',
    });
  });

  test('admin cookie auth supports login, me, refresh, logout, and cookie-protected admin routes', async () => {
    await AuthStore.createUser({
      name: 'System Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
    });

    const login = await httpRequest(baseUrl, 'POST', '/auth/admin/login', {
      body: { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD },
    });
    expect(login.status).toBe(200);
    expect(login.body.data.user).toMatchObject({ email: DEFAULT_ADMIN_EMAIL, role: 'admin' });
    expect(login.headers['set-cookie'].join('\n')).toContain('accessToken=');
    expect(login.headers['set-cookie'].join('\n')).toContain('refreshToken=');

    let cookies = cookieHeader(login.headers['set-cookie']);
    const me = await httpRequest(baseUrl, 'GET', '/auth/admin/me', {
      headers: { cookie: cookies },
    });
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(DEFAULT_ADMIN_EMAIL);

    const created = await httpRequest(baseUrl, 'POST', '/admin/users', {
      headers: { cookie: cookies },
      body: {
        name: 'Second Admin',
        email: 'cookie-admin@example.com',
        role: 'admin',
        password: 'secret123',
      },
    });
    expect(created.status).toBe(201);
    expect(created.body.data.user).toMatchObject({ email: 'cookie-admin@example.com', role: 'admin' });

    const refresh = await httpRequest(baseUrl, 'POST', '/auth/admin/refresh', {
      headers: { cookie: cookies },
    });
    expect(refresh.status).toBe(200);
    cookies = cookieHeader(refresh.headers['set-cookie']);
    expect(cookies).toContain('accessToken=');

    const logout = await httpRequest(baseUrl, 'POST', '/auth/admin/logout', {
      headers: { cookie: cookies },
    });
    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie'].join('\n')).toContain('accessToken=;');
  });

  test('inactive users cannot login or use existing access tokens', async () => {
    await AuthStore.createUser({
      name: 'System Admin',
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
    });
    const adminLogin = await httpRequest(baseUrl, 'POST', '/auth/admin/login', {
      body: { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD },
    });
    const adminCookies = cookieHeader(adminLogin.headers['set-cookie']);

    const volunteerAuth = await AuthStore.createUser({
      name: 'Inactive Volunteer',
      username: 'inactive_volunteer',
      email: 'inactive-volunteer@example.com',
      password: 'secret123',
      role: 'volunteer',
    });

    const beforeInactive = await httpRequest(baseUrl, 'POST', '/auth/login', {
      body: {
        identifier: 'inactive_volunteer',
        password: 'secret123',
        accessRole: 'volunteer',
      },
    });
    expect(beforeInactive.status).toBe(200);

    const status = await httpRequest(baseUrl, 'PATCH', `/admin/users/${volunteerAuth.user.id}/status`, {
      headers: { cookie: adminCookies },
      body: { status: 'inactive' },
    });
    expect(status.status).toBe(200);
    expect(status.body.data.user.status).toBe('inactive');

    const afterInactive = await httpRequest(baseUrl, 'POST', '/auth/login', {
      body: {
        identifier: 'inactive_volunteer',
        password: 'secret123',
        accessRole: 'volunteer',
      },
    });
    expect(afterInactive.status).toBe(401);

    const existingToken = await httpRequest(baseUrl, 'GET', '/users/me', {
      headers: { authorization: `Bearer ${beforeInactive.body.accessToken}` },
    });
    expect(existingToken.status).toBe(401);

    const secondAdmin = await AuthStore.createUser({
      name: 'Inactive Admin',
      email: 'inactive-admin@example.com',
      password: 'secret123',
      role: 'admin',
    });
    const secondLogin = await httpRequest(baseUrl, 'POST', '/auth/admin/login', {
      body: { email: 'inactive-admin@example.com', password: 'secret123' },
    });
    expect(secondLogin.status).toBe(200);
    await httpRequest(baseUrl, 'PATCH', `/admin/users/${secondAdmin.user.id}/status`, {
      headers: { cookie: adminCookies },
      body: { status: 'inactive' },
    });

    const inactiveAdminLogin = await httpRequest(baseUrl, 'POST', '/auth/admin/login', {
      body: { email: 'inactive-admin@example.com', password: 'secret123' },
    });
    expect(inactiveAdminLogin.status).toBe(401);
    const oldAdminCookieMe = await httpRequest(baseUrl, 'GET', '/auth/admin/me', {
      headers: { cookie: cookieHeader(secondLogin.headers['set-cookie']) },
    });
    expect(oldAdminCookieMe.status).toBe(401);
  });
});
