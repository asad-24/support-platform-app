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
      const updated = await SchoolStore.updateSchoolAsAdmin(school, req.body, req.auth.user.id);
      return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(updated) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await SchoolStore.getSchool(req.params.id);
      if (!school) return res.status(404).json({ success: false, error: 'School not found' });
      const archived = await SchoolStore.archiveSchool(school, req.auth.user.id);
      return res.json({ success: true, data: { archived: true, school: await SchoolStore.serializeSchoolAggregate(archived) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async restore(req, res) {
    try {
      const school = await SchoolStore.getSchool(req.params.id);
      if (!school) return res.status(404).json({ success: false, error: 'School not found' });
      const restored = await SchoolStore.restoreSchool(school);
      return res.json({ success: true, data: { restored: true, school: await SchoolStore.serializeSchoolAggregate(restored) } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new AdminSchoolController();
