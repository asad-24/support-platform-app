'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class AdminSchoolReviewController {
  async index(req, res) {
    const school = await SchoolStore.getSchool(req.params.id);
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });
    const rows = await SchoolStore.SchoolReview.findAll({ where: { schoolId: school.id }, order: [['createdAt', 'DESC']] });
    return res.json({ success: true, data: { items: rows.map(SchoolStore.serializeReview) } });
  }

  async approve(req, res) {
    req.body.status = 'approved';
    return this.update_status(req, res);
  }

  async reject(req, res) {
    req.body.status = 'rejected';
    return this.update_status(req, res);
  }

  async update_status(req, res) {
    try {
      const school = await SchoolStore.getSchool(req.params.id);
      const updated = await SchoolStore.reviewSchool(school, req.auth.user.id, req.body.status, req.body.comment);
      return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(updated) } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new AdminSchoolReviewController();
