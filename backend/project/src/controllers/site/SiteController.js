'use strict';

const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');
const FileStorage = require('@src/services/FileStorage');

const MAX_VIDEO_BYTES = 4 * 1024 * 1024;

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
      let mediaData = req.body;
      if (req.file) {
        if (req.file.mimetype.startsWith('video/') && req.file.size > MAX_VIDEO_BYTES) {
          return res.status(400).json({
            error: {
              code: 'VIDEO_TOO_LARGE',
              message: 'Video uploads must be 4 MB or smaller.',
            },
          });
        }
        const stored = await FileStorage.saveUploadedFile(req.file, {
          folder: `schools/${req.params.id}`,
          req,
        });
        mediaData = {
          ...mediaData,
          url: stored.publicUrl,
          fileUrl: stored.publicUrl,
          localPath: stored.localPath,
          filename: stored.filename,
          originalFilename: req.file.originalname,
          mediaKind: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
          mimeType: stored.mimeType,
          size: stored.size,
        };
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
