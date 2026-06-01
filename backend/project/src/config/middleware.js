const MIDDLEWARE_CONFIG = {
  aliases: {
    admin: 'AdminOnlyMiddleware',
    auth: 'AccessTokenMiddleware',
    volunteer: 'VolunteerOnlyMiddleware',
    profileComplete: 'ProfileCompleteMiddleware',
  },
};

module.exports = MIDDLEWARE_CONFIG;
