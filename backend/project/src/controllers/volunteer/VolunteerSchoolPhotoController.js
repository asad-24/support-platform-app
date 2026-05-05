'use strict';

const SchoolStore = require('@src/services/SchoolStore');
const FileStorage = require('@src/services/FileStorage');

function handleError(res, error) {
  return res.status(error.status || 500).json({ success: false, error: error.message || 'Request failed' });
}

class VolunteerSchoolPhotoController {
  async getSchool(req, res) {
    const school = await SchoolStore.getOwnedSchool(req.params.schoolId || req.params.id, req.auth.user.id);
    if (!school) {
      res.status(404).json({ success: false, error: 'School not found' });
      return null;
    }
    return school;
  }

  async index(req, res) {
    const school = await this.getSchool(req, res);
    if (!school) return;
    const rows = await SchoolStore.SchoolPhoto.findAll({ where: { schoolId: school.id }, order: [['id', 'ASC']] });
    return res.json({ success: true, data: { items: rows.map(SchoolStore.serializePhoto) } });
  }

  async store(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      if (req.file) {
        if (!req.file.mimetype.startsWith('image/')) {
          return res.status(400).json({
            success: false,
            error: 'School photo must be an image file',
          });
        }
        const stored = await FileStorage.saveUploadedFile(req.file, {
          folder: `schools/${school.id}`,
          req,
        });
        const data = SchoolStore.normalizePhotoPayload({
          ...req.body,
          fileUrl: stored.publicUrl,
          url: stored.publicUrl,
          localPath: stored.localPath,
        });
        const row = await SchoolStore.SchoolPhoto.create({
          ...data,
          schoolId: school.id,
          uploadedByUserId: req.auth.user.id,
        });
        return res.status(201).json({ success: true, data: { items: [SchoolStore.serializePhoto(row)] } });
      }

      const payloads = Array.isArray(req.body.photos) ? req.body.photos : [req.body];
      const rows = [];
      for (const payload of payloads) {
        const data = SchoolStore.normalizePhotoPayload(payload);
        if (!data.fileUrl) continue;
        rows.push(await SchoolStore.SchoolPhoto.create({ ...data, schoolId: school.id, uploadedByUserId: req.auth.user.id }));
      }
      return res.status(201).json({ success: true, data: { items: rows.map(SchoolStore.serializePhoto) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    const school = await this.getSchool(req, res);
    if (!school) return;
    const row = await SchoolStore.SchoolPhoto.findOne({ where: { id: req.params.photoId || req.params.id, schoolId: school.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Photo not found' });
    return res.json({ success: true, data: { photo: SchoolStore.serializePhoto(row) } });
  }

  async update(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const row = await SchoolStore.SchoolPhoto.findOne({ where: { id: req.params.photoId || req.params.id, schoolId: school.id } });
      if (!row) return res.status(404).json({ success: false, error: 'Photo not found' });
      await row.update(SchoolStore.normalizePhotoPayload(req.body));
      return res.json({ success: true, data: { photo: SchoolStore.serializePhoto(row) } });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      const school = await this.getSchool(req, res);
      if (!school) return;
      await SchoolStore.requireEditable(school);
      const deleted = await SchoolStore.SchoolPhoto.destroy({ where: { id: req.params.photoId || req.params.id, schoolId: school.id } });
      if (!deleted) return res.status(404).json({ success: false, error: 'Photo not found' });
      return res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new VolunteerSchoolPhotoController();
