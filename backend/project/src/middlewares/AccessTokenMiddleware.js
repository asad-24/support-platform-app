const Middleware = require('../../core/interfaces/Middleware');
const AuthStore = require('@src/services/AuthStore');
const { ACCESS_COOKIE, reqCookies } = require('@src/services/auth/cookies');

function extractBearerToken(headerValue) {
  if (typeof headerValue !== 'string') return '';
  const [scheme, token] = headerValue.trim().split(/\s+/, 2);
  if (!scheme || !token) return '';
  return scheme.toLowerCase() === 'bearer' ? token : '';
}

class AccessTokenMiddleware extends Middleware {
  async handle(req, res, next) {
    try {
      const accessToken = extractBearerToken(req.header('authorization'))
        || req.header('x-access-token')
        || req.query.access_token
        || reqCookies(req)[ACCESS_COOKIE];

      if (!accessToken) {
        return res.status(401).json({ success: false, error: 'Access token is required' });
      }

      const user = await AuthStore.getUserByToken(accessToken);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid access token' });
      }

      req.auth = { accessToken, user };
      return next();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AccessTokenMiddleware;
