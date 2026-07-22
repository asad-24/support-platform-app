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

class AdminSponsorRequestController {
  async index(req, res) {
    const data = await SponsorRequestStore.list(req.query);
    return res.json({ success: true, data });
  }

  async show(req, res) {
    try {
      const sponsorRequest = await SponsorRequestStore.get(req.params.id);
      return res.json({
        success: true,
        data: {
          sponsorRequest: SponsorRequestStore.serialize(sponsorRequest),
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update_status(req, res) {
    try {
      const sponsorRequest = await SponsorRequestStore.updateStatus(req.params.id, req.body.status);
      return res.json({
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

module.exports = new AdminSponsorRequestController();
