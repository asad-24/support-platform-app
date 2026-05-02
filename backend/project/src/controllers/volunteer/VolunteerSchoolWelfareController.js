'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerSchoolWelfareController {
  async getSchool(req, res) {
    const school = await SchoolStore.getOwnedSchool(req.params.schoolId, req.auth.user.id);
    if (!school) {
      res.status(404).json({ success: false, error: 'School not found' });
      return null;
    }
    return school;
  }

  async show(req, res) {
    const school = await this.getSchool(req, res);
    if (!school) return;
    const row = await SchoolStore.SchoolWelfareAssessment.findOne({ where: { schoolId: school.id } });
    return res.json({ success: true, data: { welfare: SchoolStore.serializeWelfare(row) } });
  }

  async upsert(req, res) {
    return this.update(req, res);
  }

  async update(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const row = await SchoolStore.upsertOne(SchoolStore.SchoolWelfareAssessment, { schoolId: school.id }, SchoolStore.normalizeWelfarePayload(req.body));
      return res.json({ success: true, data: { welfare: SchoolStore.serializeWelfare(row) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      await SchoolStore.SchoolWelfareAssessment.destroy({ where: { schoolId: school.id } });
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new VolunteerSchoolWelfareController();
