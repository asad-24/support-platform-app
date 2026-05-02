const crypto = require('node:crypto');

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

function issueAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

function issueRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
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
  verifyPassword,
};
