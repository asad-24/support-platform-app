'use strict';

const ContactRequestStore = require('@src/services/ContactRequestStore');

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

class ContactRequestController {
  async store(req, res) {
    try {
      await ContactRequestStore.create(req.body);
      return res.status(201).json({ success: true, data: { sent: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new ContactRequestController();
