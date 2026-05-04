'use strict';

const Op = require('@core/util/classes/Operators');
const User = require('@src/models/User');
const VolunteerProfile = require('@src/models/VolunteerProfile');
const AuthStore = require('@src/services/AuthStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');
const SchoolStore = require('@src/services/SchoolStore');
const { sanitizeUser } = require('@src/services/auth/credentials');

function pagination(query = {}) {
  const limit = Math.max(1, Math.min(Number(query.limit) || 25, 100));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, offset: (page - 1) * limit, page };
}

class AdminVolunteerController {
  async index(req, res) {
    const where = { role: 'volunteer' };
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { limit, offset, page } = pagination(req.query);
    const { rows, count } = await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit, offset });
    const items = [];
    for (const user of rows) {
      const profile = await VolunteerProfile.findOne({ where: { userId: user.id } });
      if (req.query.profile_completed === 'true' && !ProfileStore.isComplete(profile)) continue;
      if (req.query.profile_completed === 'false' && ProfileStore.isComplete(profile)) continue;
      items.push({ ...sanitizeUser(user), profile: ProfileStore.serialize(profile), profile_completed: ProfileStore.isComplete(profile) });
    }

    return res.json({ success: true, data: { items, pagination: { total: count, page, limit } } });
  }

  async store(req, res) {
    try {
      const auth = await AuthStore.createUser({ ...req.body, role: 'volunteer' });
      return res.status(201).json({ success: true, data: { user: auth.user } });
    } catch (error) {
      return res.status(error.code === 'EMAIL_TAKEN' ? 409 : 500).json({ success: false, error: error.message || 'Failed to create volunteer' });
    }
  }

  async show(req, res) {
    const summary = await SchoolStore.volunteerSummary(req.params.id);
    if (!summary) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    return res.json({ success: true, data: summary });
  }

  async update(req, res) {
    const user = await User.findOne({ where: { id: req.params.id, role: 'volunteer' } });
    if (!user) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    if (req.body.name) user.name = String(req.body.name).trim();
    await user.save();
    if (req.body.profile) await ProfileStore.upsertForUser(user.id, req.body.profile);
    return this.show(req, res);
  }

  async destroy(req, res) {
    const user = await User.findOne({ where: { id: req.params.id, role: 'volunteer' } });
    if (!user) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    await user.destroy();
    return res.json({ success: true, data: { deleted: true } });
  }

  async schools(req, res) {
    const user = await User.findOne({ where: { id: req.params.id, role: 'volunteer' } });
    if (!user) return res.status(404).json({ success: false, error: 'Volunteer not found' });
    const data = await SchoolStore.listSchools(req.query, { submittedByUserId: user.id });
    return res.json({ success: true, data });
  }
}

module.exports = new AdminVolunteerController();
