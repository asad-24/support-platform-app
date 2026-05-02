const User = require('@src/models/User');
const { Op } = require('sequelize');
const {
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  normalizeEmail,
  normalizeUsername,
  sanitizeUser,
  verifyPassword,
} = require('@src/services/auth/credentials');

function adminDefaults() {
  return {
    name: String(process.env.ADMIN_NAME || 'System Admin').trim(),
    email: normalizeEmail(process.env.ADMIN_EMAIL || 'admin@schoolsupportatlas.local'),
    password: String(process.env.ADMIN_PASSWORD || 'admin123'),
  };
}

async function createStoredUser({ name, email, username = null, password, role }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedEmail },
        ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
      ],
    },
  });
  if (existingUser) {
    const emailTaken = existingUser.email === normalizedEmail;
    const error = new Error(emailTaken ? 'Email already registered' : 'Username already registered');
    error.code = emailTaken ? 'EMAIL_TAKEN' : 'USERNAME_TAKEN';
    throw error;
  }

  const { salt, hash } = hashPassword(password);
  const accessToken = issueAccessToken();
  const refreshToken = issueRefreshToken();
  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    role,
    passwordSalt: salt,
    passwordHash: hash,
    accessToken,
    accessTokenCreatedAt: new Date(),
    refreshToken,
    refreshTokenCreatedAt: new Date(),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

async function ensureDefaultAdmin() {
  const defaults = adminDefaults();
  const existing = await User.findOne({ where: { email: defaults.email } });
  if (existing) return existing;

  const { salt, hash } = hashPassword(defaults.password);
  return User.create({
    name: defaults.name,
    email: defaults.email,
    username: null,
    role: 'admin',
    passwordSalt: salt,
    passwordHash: hash,
    accessToken: null,
    accessTokenCreatedAt: null,
    refreshToken: null,
    refreshTokenCreatedAt: null,
  });
}

async function createUser({ name, email, username, password, role }) {
  return createStoredUser({ name, email, username, password, role });
}

async function authenticate({ email, password, role }) {
  await ensureDefaultAdmin();
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) return null;

  if (role && user.role !== role) return null;

  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;

  const accessToken = issueAccessToken();
  user.accessToken = accessToken;
  user.accessTokenCreatedAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
  };
}

async function authenticateMobile({ identifier, password, accessRole }) {
  await ensureDefaultAdmin();
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    },
  });
  if (!user) return null;
  if (accessRole && user.role !== accessRole) return null;
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) return null;

  const accessToken = issueAccessToken();
  const refreshToken = issueRefreshToken();
  user.accessToken = accessToken;
  user.accessTokenCreatedAt = new Date();
  user.refreshToken = refreshToken;
  user.refreshTokenCreatedAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
}

async function getUserByToken(accessToken) {
  const user = await User.findOne({ where: { accessToken } });
  if (!user) return null;
  return sanitizeUser(user);
}

async function getStoredUserByToken(accessToken) {
  return User.findOne({ where: { accessToken } });
}

async function getStoredUserById(userId) {
  return User.findByPk(userId);
}

async function refresh(refreshToken) {
  const user = await User.findOne({ where: { refreshToken } });
  if (!user) return null;

  user.accessToken = issueAccessToken();
  user.accessTokenCreatedAt = new Date();
  user.refreshToken = issueRefreshToken();
  user.refreshTokenCreatedAt = new Date();
  await user.save();

  return {
    user,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
  };
}

async function logout({ accessToken = null, refreshToken = null } = {}) {
  const where = refreshToken
    ? { refreshToken }
    : (accessToken ? { accessToken } : null);
  if (!where) return false;

  const user = await User.findOne({ where });
  if (!user) return false;
  user.accessToken = null;
  user.accessTokenCreatedAt = null;
  user.refreshToken = null;
  user.refreshTokenCreatedAt = null;
  await user.save();
  return true;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) return false;
  if (!verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) return false;

  const { salt, hash } = hashPassword(newPassword);
  user.passwordSalt = salt;
  user.passwordHash = hash;
  await user.save();
  return true;
}

async function usernameAvailable(username) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return false;
  const user = await User.findOne({ where: { username: normalizedUsername } });
  return !user;
}

async function reset() {
  await User.destroy({ where: {} });
}

module.exports = {
  authenticate,
  authenticateMobile,
  changePassword,
  createUser,
  ensureDefaultAdmin,
  getStoredUserById,
  getStoredUserByToken,
  getUserByToken,
  logout,
  refresh,
  reset,
  usernameAvailable,
};
