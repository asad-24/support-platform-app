'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerSchoolController {
  async index(req, res) {
    const data = await SchoolStore.listSchools(req.query, { submittedByUserId: req.auth.user.id });
    return res.json({ success: true, data });
  }

  async submit(req, res) {
    try {
      const school = await SchoolStore.createSchool(req.auth.user.id, req.body, 'pending');
      return res.status(201).json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async create_draft(req, res) {
    try {
      const school = await SchoolStore.createSchool(req.auth.user.id, req.body, 'draft');
      return res.status(201).json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async list_drafts(req, res) {
    const data = await SchoolStore.listSchools({ ...req.query, status: 'draft' }, { submittedByUserId: req.auth.user.id });
    return res.json({ success: true, data });
  }

  async show(req, res) {
    const school = await SchoolStore.getOwnedSchool(req.params.id, req.auth.user.id);
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });
    return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
  }

  async show_draft(req, res) {
    const school = await SchoolStore.getOwnedSchool(req.params.id, req.auth.user.id);
    if (!school || school.status !== 'draft') return res.status(404).json({ success: false, error: 'Draft not found' });
    return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
  }

  async update(req, res) {
    try {
      const school = await SchoolStore.getOwnedSchool(req.params.id, req.auth.user.id);
      const updated = await SchoolStore.updateSchool(school, req.body, req.auth.user.id);
      return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(updated) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update_draft(req, res) {
    return this.update(req, res);
  }

  async destroy(req, res) {
    try {
      const school = await SchoolStore.getOwnedSchool(req.params.id, req.auth.user.id);
      await SchoolStore.deleteSchool(school);
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete_draft(req, res) {
    return this.destroy(req, res);
  }

  async submit_existing(req, res) {
    return this.submit_draft(req, res);
  }

  async submit_draft(req, res) {
    try {
      const school = await SchoolStore.getOwnedSchool(req.params.id, req.auth.user.id);
      const submitted = await SchoolStore.submitSchool(school, req.auth.user.id);
      return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(submitted) } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new VolunteerSchoolController();
