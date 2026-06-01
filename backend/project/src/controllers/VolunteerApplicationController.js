'use strict';

const VolunteerApplicationStore = require('@src/services/VolunteerApplicationStore');

function apiError(res, error) {
  return res.status(error.status || 500).json({
    error: {
      code: error.code || 'REQUEST_FAILED',
      message: error.message || 'Request failed.',
      ...(error.fields ? { fields: error.fields } : {}),
    },
  });
}

class VolunteerApplicationController {
  async store(req, res) {
    try {
      const application = await VolunteerApplicationStore.create(req.body);
      return res.status(201).json({
        requestId: application.requestId,
        status: application.status,
        submittedAt: application.createdAt,
        message: 'Your registration request is pending admin review.',
      });
    } catch (error) {
      return apiError(res, error);
    }
  }
}

module.exports = new VolunteerApplicationController();
