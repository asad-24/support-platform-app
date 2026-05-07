const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

function jwtSecret() {
  return process.env.JWT_SECRET || process.env.APP_KEY || 'support-atlas-dev-secret';
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
  const value = String(username || '').trim().toLowerCase();
  return value || null;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, passwordSalt, passwordHash) {
  const { hash } = hashPassword(password, passwordSalt);
  const left = Buffer.from(hash, 'hex');
  const right = Buffer.from(passwordHash, 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function issueAccessToken(user = {}) {
  return jwt.sign(
    { sub: user.id ? String(user.id) : undefined, role: user.role, typ: 'access', jti: crypto.randomUUID() },
    jwtSecret(),
    { expiresIn: process.env.JWT_ACCESS_TTL || '15m' }
  );
}

function issueRefreshToken(user = {}) {
  return jwt.sign(
    { sub: user.id ? String(user.id) : undefined, role: user.role, typ: 'refresh', jti: crypto.randomUUID() },
    jwtSecret(),
    { expiresIn: process.env.JWT_REFRESH_TTL || '30d' }
  );
}

function verifyToken(token, type = null) {
  try {
    const payload = jwt.verify(String(token || ''), jwtSecret());
    if (type && payload.typ !== type) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status || 'active',
    created_at: user.createdAt,
  };
}

module.exports = {
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  normalizeEmail,
  normalizeUsername,
  sanitizeUser,
  verifyToken,
  verifyPassword,
};
