const Middleware = require('../../core/interfaces/Middleware');

class VolunteerOnlyMiddleware extends Middleware {
  handle(req, res, next) {
    if (!req.auth || !req.auth.user || req.auth.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, error: 'Volunteer access is required' });
    }

    return next();
  }
}

module.exports = VolunteerOnlyMiddleware;
