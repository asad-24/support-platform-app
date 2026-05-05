'use strict';

const ProfileStore = require('@src/services/VolunteerProfileStore');
const VolunteerActivityLog = require('@src/models/VolunteerActivityLog');
const FileStorage = require('@src/services/FileStorage');
const User = require('@src/models/User');

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
      const profileBody = ProfileStore.normalizeEditablePayload(req.body);
      const requestedName = profileBody.fullName;
      if (!profileBody.fullName) profileBody.fullName = req.auth.user.name;

      if (req.file) {
        if (!req.file.mimetype.startsWith('image/')) {
          return res.status(400).json({
            success: false,
            error: 'Profile picture must be an image file',
          });
        }
        const stored = await FileStorage.saveUploadedFile(req.file, {
          folder: `profiles/${req.auth.user.id}`,
          req,
        });
        profileBody.profileImagePath = stored.publicUrl;
      }

      if (requestedName) {
        const user = await User.findByPk(req.auth.user.id);
        if (user) {
          user.name = requestedName;
          await user.save();
          req.auth.user = { ...req.auth.user, name: user.name };
        }
      }

      const profile = await ProfileStore.upsertForUser(req.auth.user.id, profileBody);
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
