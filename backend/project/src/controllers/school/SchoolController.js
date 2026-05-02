'use strict';

const SchoolStore = require('@src/services/SchoolStore');

class SchoolController {
  async index(req, res) {
    const data = await SchoolStore.listSchools(req.query, { status: 'approved' });
    return res.json({ success: true, data });
  }

  async show(req, res) {
    const school = await SchoolStore.getSchool(req.params.id);
    if (!school || school.status !== 'approved') {
      return res.status(404).json({ success: false, error: 'School not found' });
    }
    await SchoolStore.logView(school.id, req.auth.user.id);
    return res.json({ success: true, data: { school: await SchoolStore.serializeSchoolAggregate(school) } });
  }
}

module.exports = new SchoolController();
