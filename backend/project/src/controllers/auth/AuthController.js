const AuthStore = require('@src/services/AuthStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');

const ALLOWED_ROLES = new Set(['admin', 'volunteer']);
const MOBILE_ACCESS_ROLES = new Set(['volunteer', 'helper']);

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRole(value) {
  const role = readString(value).toLowerCase();
  if (role === 'volumtier') return 'volunteer';
  return role;
}

function validateCredentials({ nameRequired = false, roleRequired = false, body = {} }) {
  const name = readString(body.name);
  const email = readString(body.email).toLowerCase();
  const password = readString(body.password);
  const role = normalizeRole(body.role);

  if (nameRequired && !name) {
    return { error: 'Name is required' };
  }

  if (!email) {
    return { error: 'Email is required' };
  }

  if (!password) {
    return { error: 'Password is required' };
  }

  if (roleRequired && !role) {
    return { error: 'Role is required' };
  }

  if (role && !ALLOWED_ROLES.has(role)) {
    return { error: 'Role must be admin or volunteer' };
  }

  return { name, email, password, role };
}

function validationError(res, fields, message = 'Please correct the highlighted fields.') {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message,
      fields,
    },
  });
}

function mobileError(res, status, code, message, fields = undefined) {
  return res.status(status).json({
    error: {
      code,
      message,
      ...(fields ? { fields } : {}),
    },
  });
}

function permissionsFor(role) {
  if (role === 'volunteer') return ['sites:create', 'sites:update:assigned'];
  if (role === 'helper') return ['sites:read', 'support:offer'];
  return ['admin:*'];
}

async function flutterUser(user) {
  const profile = user.role === 'volunteer'
    ? await ProfileStore.getByUserId(user.id)
    : null;
  const profileData = user.role === 'volunteer'
    ? ProfileStore.serializeForFlutter(profile)
    : {
        phone: null,
        state: null,
        lga: null,
        address: null,
        dateOfBirth: null,
        gender: null,
        educationLevel: null,
        occupation: null,
        skills: null,
        volunteerExperience: null,
        availability: null,
        volunteeringMode: null,
        motivation: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        profileImagePath: null,
        profileComplete: true,
      };

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'fieldWorker',
    username: user.username,
    ...profileData,
    permissions: permissionsFor(user.role),
  };
}

class AuthController {
  async sign_up(req, res) {
    const payload = validateCredentials({ nameRequired: true, body: req.body });
    if (payload.error) {
      return res.status(400).json({ success: false, error: payload.error });
    }

    const role = payload.role || 'volunteer';
    if (role !== 'volunteer') {
      return res.status(403).json({ success: false, error: 'Public sign-up is only available for volunteers' });
    }

    try {
      const auth = await AuthStore.createUser({ ...payload, role });
      return res.status(201).json({
        success: true,
        data: {
          user: auth.user,
          access_token: auth.accessToken,
          token_type: 'Bearer',
          ...(auth.user.role === 'volunteer' ? await ProfileStore.getStatus(auth.user.id) : {}),
        },
      });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        return res.status(409).json({ success: false, error: error.message });
      }

      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  }

  async sign_in(req, res) {
    const payload = validateCredentials({ body: req.body });
    if (payload.error) {
      return res.status(400).json({ success: false, error: payload.error });
    }

    const auth = await AuthStore.authenticate(payload);
    if (!auth) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      data: {
        user: auth.user,
        access_token: auth.accessToken,
        token_type: 'Bearer',
        ...(auth.user.role === 'volunteer' ? await ProfileStore.getStatus(auth.user.id) : {}),
      },
    });
  }

  async create_user(req, res) {
    const payload = validateCredentials({ nameRequired: true, roleRequired: true, body: req.body });
    if (payload.error) {
      return res.status(400).json({ success: false, error: payload.error });
    }

    try {
      const auth = await AuthStore.createUser(payload);
      return res.status(201).json({
        success: true,
        data: {
          user: auth.user,
        },
      });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        return res.status(409).json({ success: false, error: error.message });
      }

      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  }

  async me(req, res) {
    return res.json({
      success: true,
      data: {
        user: req.auth.user,
        ...(req.auth.user.role === 'volunteer' ? await ProfileStore.getStatus(req.auth.user.id) : {}),
      },
    });
  }

  async login(req, res) {
    const identifier = readString(req.body.identifier || req.body.email).toLowerCase();
    const password = readString(req.body.password);
    const accessRole = normalizeRole(req.body.accessRole || req.body.access_role);
    const fields = {};

    if (!identifier) fields.identifier = 'Email or username is required';
    if (!password) fields.password = 'Password is required';
    if (!accessRole) fields.accessRole = 'Access role is required';
    if (accessRole && !MOBILE_ACCESS_ROLES.has(accessRole)) {
      fields.accessRole = 'Access role must be volunteer or helper';
    }
    if (Object.keys(fields).length) return validationError(res, fields);

    const auth = await AuthStore.authenticateMobile({ identifier, password, accessRole });
    if (!auth) {
      return mobileError(res, 401, 'INVALID_CREDENTIALS', 'User is not registered or the password is incorrect.');
    }

    return res.json({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      accessRole,
      user: await flutterUser(auth.user),
    });
  }

  async refresh(req, res) {
    const refreshToken = readString(req.body.refreshToken || req.body.refresh_token);
    if (!refreshToken) {
      return validationError(res, { refreshToken: 'Refresh token is required' });
    }

    const auth = await AuthStore.refresh(refreshToken);
    if (!auth) {
      return mobileError(res, 401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token.');
    }

    return res.json({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    });
  }

  async logout(req, res) {
    const refreshToken = readString(req.body.refreshToken || req.body.refresh_token);
    const accessToken = req.auth && req.auth.accessToken;
    await AuthStore.logout({ accessToken, refreshToken });
    return res.json({ success: true });
  }

  async username_available(req, res) {
    const username = readString(req.query.username).toLowerCase();
    if (!username) {
      return validationError(res, { username: 'Username is required' });
    }

    return res.json({
      username,
      available: await AuthStore.usernameAvailable(username),
    });
  }

  async signup(req, res) {
    const username = readString(req.body.username).toLowerCase();
    const email = readString(req.body.email).toLowerCase();
    const password = readString(req.body.password);
    const accessRole = normalizeRole(req.body.accessRole || req.body.access_role);
    const fields = {};

    if (!username) fields.username = 'Username is required';
    if (!email) fields.email = 'Email is required';
    if (!password) fields.password = 'Password is required';
    if (!accessRole) fields.accessRole = 'Access role is required';
    if (accessRole && !MOBILE_ACCESS_ROLES.has(accessRole)) {
      fields.accessRole = 'Access role must be volunteer or helper';
    }
    if (Object.keys(fields).length) return validationError(res, fields);
    if (accessRole === 'volunteer') {
      return mobileError(
        res,
        403,
        'VOLUNTEER_SIGNUP_DISABLED',
        'Volunteer registration requests must be submitted for admin review.'
      );
    }

    try {
      const auth = await AuthStore.createUser({
        name: readString(req.body.name) || username,
        username,
        email,
        password,
        role: 'helper',
      });
      const storedUser = await AuthStore.getStoredUserByToken(auth.accessToken);
      return res.status(201).json({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessRole: 'helper',
        user: await flutterUser(storedUser),
      });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        return mobileError(res, 409, 'EMAIL_TAKEN', error.message, { email: 'Email already registered' });
      }
      if (error.code === 'USERNAME_TAKEN') {
        return mobileError(res, 409, 'USERNAME_TAKEN', error.message, { username: 'Username already registered' });
      }
      return mobileError(res, 500, 'SIGNUP_FAILED', 'Failed to create user.');
    }
  }

  async change_password(req, res) {
    const currentPassword = readString(req.body.currentPassword || req.body.current_password);
    const newPassword = readString(req.body.newPassword || req.body.new_password);
    const fields = {};

    if (!currentPassword) fields.currentPassword = 'Current password is required';
    if (!newPassword) fields.newPassword = 'New password is required';
    if (Object.keys(fields).length) return validationError(res, fields);

    const changed = await AuthStore.changePassword(req.auth.user.id, currentPassword, newPassword);
    if (!changed) {
      return mobileError(res, 401, 'INVALID_CURRENT_PASSWORD', 'Current password is incorrect.');
    }

    return res.json({ success: true, message: 'Password changed.' });
  }
}

module.exports = new AuthController();
