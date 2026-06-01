const Middleware = require('../../core/interfaces/Middleware');
const ProfileStore = require('@src/services/VolunteerProfileStore');

class ProfileCompleteMiddleware extends Middleware {
  async handle(req, res, next) {
    try {
      if (!req.auth || !req.auth.user || req.auth.user.role !== 'volunteer') {
        return res.status(403).json({ success: false, error: 'Volunteer access is required' });
      }

      const profile = await ProfileStore.getByUserId(req.auth.user.id);
      if (!ProfileStore.isComplete(profile)) {
        return res.status(403).json({
          success: false,
          error: 'Volunteer profile must be completed first',
          code: 'PROFILE_INCOMPLETE',
          next_step: 'complete_profile',
        });
      }

      req.auth.profile = ProfileStore.serialize(profile);
      return next();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = ProfileCompleteMiddleware;
