'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerSchoolLocationController {
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
    const row = await SchoolStore.SchoolLocation.findOne({ where: { schoolId: school.id } });
    return res.json({ success: true, data: { location: SchoolStore.serializeLocation(row) } });
  }

  async upsert(req, res) {
    return this.update(req, res);
  }

  async update(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const row = await SchoolStore.upsertOne(SchoolStore.SchoolLocation, { schoolId: school.id }, SchoolStore.normalizeLocationPayload(req.body));
      return res.json({ success: true, data: { location: SchoolStore.serializeLocation(row) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      await SchoolStore.SchoolLocation.destroy({ where: { schoolId: school.id } });
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new VolunteerSchoolLocationController();
