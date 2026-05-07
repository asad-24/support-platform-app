'use strict';

const VolunteerApplicationStore = require('@src/services/VolunteerApplicationStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');

function applicationJson(application) {
  if (!application) return null;
  const data = typeof application.toJSON === 'function' ? application.toJSON() : application;
  const { password, ...safe } = data;
  return safe;
}

function handleError(res, error) {
  return res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'REQUEST_FAILED',
      message: error.message || 'Request failed.',
    },
  });
}

class AdminVolunteerApplicationController {
  async index(req, res) {
    const applications = await VolunteerApplicationStore.list(req.query);
    return res.json({
      success: true,
      data: {
        items: applications.map(applicationJson),
      },
    });
  }

  async show(req, res) {
    try {
      const application = await VolunteerApplicationStore.get(req.params.id);
      return res.json({
        success: true,
        data: {
          application: applicationJson(application),
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async approve(req, res) {
    try {
      const result = await VolunteerApplicationStore.approve(req.params.id, req.auth.user.id, req.body);
      return res.json({
        success: true,
        data: {
          application: applicationJson(result.application),
          user: result.user,
          profile: ProfileStore.serialize(result.profile),
          username: result.username,
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async reject(req, res) {
    try {
      const application = await VolunteerApplicationStore.reject(req.params.id, req.auth.user.id, req.body);
      return res.json({
        success: true,
        data: {
          application: applicationJson(application),
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new AdminVolunteerApplicationController();
