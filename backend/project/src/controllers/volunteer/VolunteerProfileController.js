'use strict';

const ProfileStore = require('@src/services/VolunteerProfileStore');
const VolunteerActivityLog = require('@src/models/VolunteerActivityLog');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerProfileController {
  async show(req, res) {
    const status = await ProfileStore.getStatus(req.auth.user.id);
    return res.json({ success: true, data: status });
  }

  async store(req, res) {
    return this.update(req, res, 201);
  }

  async update(req, res, successStatus = 200) {
    const statusCode = typeof successStatus === 'number' ? successStatus : 200;
    try {
      const profile = await ProfileStore.upsertForUser(req.auth.user.id, req.body);
      const status = await ProfileStore.getStatus(req.auth.user.id);
      await VolunteerActivityLog.create({ userId: req.auth.user.id, action: 'profile_updated' });
      return res.status(statusCode).json({
        success: true,
        data: {
          profile: ProfileStore.serialize(profile),
          profile_completed: status.profile_completed,
          next_step: status.next_step,
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    await ProfileStore.destroyForUser(req.auth.user.id);
    return res.json({ success: true, data: { deleted: true } });
  }

  async activity(req, res) {
    const rows = await VolunteerActivityLog.findAll({
      where: { userId: req.auth.user.id },
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 25, 100),
    });

    return res.json({
      success: true,
      data: {
        items: rows.map((row) => {
          const data = row.toJSON();
          return {
            id: data.id,
            school_id: data.schoolId,
            action: data.action,
            metadata: data.metadata,
            created_at: data.createdAt,
          };
        }),
      },
    });
  }
}

module.exports = new VolunteerProfileController();
