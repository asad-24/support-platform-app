'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class AdminSchoolController {
  async index(req, res) {
    const data = await SchoolStore.listSchools(req.query);
    return res.json({ success: true, data });
  }

  async store(req, res) {
    try {
      const school = await SchoolStore.createSchool(req.body.submitted_by_user_id || req.auth.user.id, req.body, req.body.status || 'draft');
      return res.status(201).json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    const school = await SchoolStore.getSchool(req.params.id);
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });
    return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
  }

  async update(req, res) {
    try {
      const school = await SchoolStore.getSchool(req.params.id);
      if (!school) return res.status(404).json({ success: false, error: 'School not found' });
      const updated = await SchoolStore.updateSchool(school, req.body, school.submittedByUserId);
      return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(updated) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await SchoolStore.getSchool(req.params.id);
      if (!school) return res.status(404).json({ success: false, error: 'School not found' });
      await SchoolStore.deleteSchool(school);
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new AdminSchoolController();
