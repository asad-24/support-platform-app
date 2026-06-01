'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerSchoolOperatorController {
  async getSchool(req, res) {
    const school = await SchoolStore.getOwnedSchool(req.params.schoolId, req.auth.user.id);
    if (!school) {
      res.status(404).json({ success: false, error: 'School not found' });
      return null;
    }
    return school;
  }

  async index(req, res) {
    const school = await this.getSchool(req, res);
    if (!school) return;
    const rows = await SchoolStore.SchoolOperator.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] });
    return res.json({ success: true, data: { items: rows.map(SchoolStore.serializeOperator) } });
  }

  async store(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const row = await SchoolStore.SchoolOperator.create({ ...SchoolStore.normalizeOperatorPayload(req.body), schoolId: school.id });
      return res.status(201).json({ success: true, data: { operator: SchoolStore.serializeOperator(row) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    const school = await this.getSchool(req, res);
    if (!school) return;
    const row = await SchoolStore.SchoolOperator.findOne({ where: { id: req.params.id, schoolId: school.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Operator not found' });
    return res.json({ success: true, data: { operator: SchoolStore.serializeOperator(row) } });
  }

  async update(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const row = await SchoolStore.SchoolOperator.findOne({ where: { id: req.params.id, schoolId: school.id } });
      if (!row) return res.status(404).json({ success: false, error: 'Operator not found' });
      await row.update(SchoolStore.normalizeOperatorPayload(req.body));
      return res.json({ success: true, data: { operator: SchoolStore.serializeOperator(row) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const deleted = await SchoolStore.SchoolOperator.destroy({ where: { id: req.params.id, schoolId: school.id } });
      if (!deleted) return res.status(404).json({ success: false, error: 'Operator not found' });
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new VolunteerSchoolOperatorController();
