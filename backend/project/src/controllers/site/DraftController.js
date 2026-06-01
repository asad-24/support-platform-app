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

class DraftController {
  async index(req, res) {
    try {
      return res.json(await FlutterSchoolStore.listDrafts(req.auth.user, req.query));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async store(req, res) {
    try {
      const draft = await FlutterSchoolStore.createDraft(req.auth.user, req.body);
      return res.status(201).json(draft);
    } catch (error) {
      return handleError(res, error);
    }
  }

  async show(req, res) {
    try {
      return res.json(await FlutterSchoolStore.getDraft(req.params.id, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    try {
      return res.json(await FlutterSchoolStore.updateDraft(req.params.id, req.auth.user, req.body));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async destroy(req, res) {
    try {
      return res.json(await FlutterSchoolStore.deleteDraft(req.params.id, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async submit(req, res) {
    try {
      return res.json(await FlutterSchoolStore.submitDraft(req.params.id, req.auth.user));
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new DraftController();
