'use strict';

const SponsorRequestStore = require('@src/services/SponsorRequestStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'REQUEST_FAILED',
      message: error.message || 'Request failed.',
      fields: error.fields,
    },
  });
}

class SponsorRequestController {
  async store(req, res) {
    try {
      const sponsorRequest = await SponsorRequestStore.create(req.body);
      return res.status(201).json({
        success: true,
        data: {
          sponsorRequest: SponsorRequestStore.serialize(sponsorRequest),
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new SponsorRequestController();
