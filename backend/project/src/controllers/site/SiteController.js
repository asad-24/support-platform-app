'use strict';

const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');

function handleError(res, error) {
  if (error.body) return res.status(error.status || 500).json(error.body);
  return res.status(error.status || 500).json({
    error: {
      code: error.status === 404 ? 'NOT_FOUND' : 'REQUEST_FAILED',
      message: error.message || 'Request failed.',
    },
  });
}

class SiteController {
  async index(req, res) {
    try {
      return res.json(await FlutterSchoolStore.listSites(req.query, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      return res.json(await FlutterSchoolStore.getVisibleSite(req.params.id, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const site = await FlutterSchoolStore.createSite(req.auth.user, req.body, { status: 'pending' });
      return res.status(201).json(site);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      return res.json(await FlutterSchoolStore.updateSite(req.params.id, req.auth.user, req.body, req.query));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      return res.json(await FlutterSchoolStore.deleteSite(req.params.id, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async media(req, res) {
    try {
      // Handle file upload
      let mediaData = req.body;
      if (req.file) {
        // Generate URL for the uploaded file
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        mediaData.url = `${baseUrl}/uploads/${req.file.filename}`;
        mediaData.filename = req.file.originalname;
        mediaData.mimeType = req.file.mimetype;
      }
      return res.status(201).json(await FlutterSchoolStore.uploadMedia(req.params.id, req.auth.user, mediaData));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async assessment(req, res) {
    try {
      return res.status(201).json(await FlutterSchoolStore.submitAssessment(req.params.id, req.auth.user, req.body));
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new SiteController();
