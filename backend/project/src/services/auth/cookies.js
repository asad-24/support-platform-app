'use strict';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

function parseCookies(header = '') {
  return String(header || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf('=');
      if (index === -1) return cookies;
      const key = decodeURIComponent(part.slice(0, index).trim());
      const value = decodeURIComponent(part.slice(index + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

function reqCookies(req) {
  return req.cookies || parseCookies(req && typeof req.header === 'function' ? req.header('cookie') : '');
}

function secureCookie() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie(),
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000));
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, cookieOptions());
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  reqCookies,
  setAuthCookies,
};
