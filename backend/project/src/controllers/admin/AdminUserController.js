'use strict';

const Op = require('@core/util/classes/Operators');
const User = require('@src/models/User');
const AuthStore = require('@src/services/AuthStore');
const { sanitizeUser } = require('@src/services/auth/credentials');

const ROLES = new Set(['admin', 'volunteer', 'helper']);
const STATUSES = new Set(['active', 'inactive']);

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pagination(query = {}) {
  const limit = Math.max(1, Math.min(Number(query.limit) || 25, 100));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, offset: (page - 1) * limit, page };
}

function userJson(user) {
  const data = sanitizeUser(user);
  return data ? { ...data, status: data.status || 'active' } : null;
}

class AdminUserController {
  async index(req, res) {
    const where = {};
    const role = readString(req.query.role).toLowerCase();
    const status = readString(req.query.status).toLowerCase();

    if (role && ROLES.has(role)) where.role = role;
    if (status && STATUSES.has(status)) where.status = status;
    if (req.query.search) {
      const search = readString(req.query.search);
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
      ];
    }

    const { limit, offset, page } = pagination(req.query);
    const { rows, count } = await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset });
    return res.json({
      success: true,
      data: {
        items: rows.map(userJson),
        pagination: { total: count, page, limit },
      },
    });
  }

  async store(req, res) {
    const name = readString(req.body.name);
    const email = readString(req.body.email).toLowerCase();
    const username = readString(req.body.username).toLowerCase() || null;
    const password = readString(req.body.password);
    const role = readString(req.body.role).toLowerCase();
    const fields = {};

    if (!name) fields.name = 'Name is required';
    if (!email) fields.email = 'Email is required';
    if (!password) fields.password = 'Password is required';
    if (!role) fields.role = 'Role is required';
    else if (!ROLES.has(role)) fields.role = 'Role must be admin, volunteer, or helper';
    if (Object.keys(fields).length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          fields,
        },
      });
    }

    try {
      const auth = await AuthStore.createUser({ name, email, username, password, role });
      return res.status(201).json({ success: true, data: { user: auth.user } });
    } catch (error) {
      const status = ['EMAIL_TAKEN', 'USERNAME_TAKEN'].includes(error.code) ? 409 : 500;
      return res.status(status).json({
        success: false,
        error: {
          code: error.code || 'USER_CREATE_FAILED',
          message: error.message || 'Failed to create user.',
        },
      });
    }
  }

  async status(req, res) {
    const status = readString(req.body.status).toLowerCase();
    if (!STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be active or inactive.',
          fields: { status: 'Status must be active or inactive' },
        },
      });
    }

    const user = await AuthStore.setStatus(req.params.id, status);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }
    return res.json({ success: true, data: { user } });
  }

  async destroy(req, res) {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }
    return res.json({ success: true, data: { deleted: true } });
  }
}

module.exports = new AdminUserController();
