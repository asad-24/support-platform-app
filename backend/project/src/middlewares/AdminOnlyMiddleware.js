const Middleware = require('../../core/interfaces/Middleware');

class AdminOnlyMiddleware extends Middleware {
  handle(req, res, next) {
    if (!req.auth || !req.auth.user || req.auth.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access is required' });
    }

    return next();
  }
}

module.exports = AdminOnlyMiddleware;
