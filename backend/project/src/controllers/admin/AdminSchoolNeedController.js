'use strict';

const SchoolNeedStore = require('@src/services/SchoolNeedStore');

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

class AdminSchoolNeedController {
  async index(req, res) {
    try {
      const data = await SchoolNeedStore.list(req.query);
      return res.json({ success: true, data });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update_status(req, res) {
    try {
      const need = await SchoolNeedStore.updateStatus(req.params.id, req.body.status, req.auth.user.id);
      return res.json({ success: true, data: { need: SchoolNeedStore.serialize(need) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const need = await SchoolNeedStore.softDelete(req.params.id, req.auth.user.id);
      return res.json({ success: true, data: { deleted: true, need: SchoolNeedStore.serialize(need) } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new AdminSchoolNeedController();
