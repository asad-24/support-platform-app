'use strict';

const SchoolStore = require('@src/services/SchoolStore');

function pagination(query = {}) {
  const limit = Math.max(1, Math.min(Number(query.limit) || 25, 100));
  const page = Math.max(1, Number(query.page) || 1);
  return { limit, offset: (page - 1) * limit, page };
}

function ownerWhere(req, extra = {}) {
  return { recipientUserId: req.auth.user.id, ...extra };
}

class VolunteerNotificationController {
  async index(req, res) {
    const where = ownerWhere(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.type) where.type = req.query.type;

    const { limit, offset, page } = pagination(req.query);
    const { rows, count } = await SchoolStore.VolunteerNotification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: {
        items: rows.map(SchoolStore.serializeVolunteerNotification),
        pagination: { total: count, page, limit },
      },
    });
  }

  async store(req, res) {
    const row = await SchoolStore.VolunteerNotification.create({
      recipientUserId: req.auth.user.id,
      actorUserId: req.body.actor_user_id || req.body.actorUserId || null,
      schoolId: req.body.school_id || req.body.schoolId || null,
      type: req.body.type || 'manual',
      title: req.body.title || 'Notification',
      message: req.body.message || '',
      status: req.body.status || 'unread',
      metadata: req.body.metadata || null,
    });

    return res.status(201).json({ success: true, data: { notification: SchoolStore.serializeVolunteerNotification(row) } });
  }

  async show(req, res) {
    const row = await SchoolStore.VolunteerNotification.findOne({ where: ownerWhere(req, { id: req.params.id }) });
    if (!row) return res.status(404).json({ success: false, error: 'Notification not found' });
    return res.json({ success: true, data: { notification: SchoolStore.serializeVolunteerNotification(row) } });
  }

  async update(req, res) {
    const row = await SchoolStore.VolunteerNotification.findOne({ where: ownerWhere(req, { id: req.params.id }) });
    if (!row) return res.status(404).json({ success: false, error: 'Notification not found' });

    await row.update({
      status: req.body.status === undefined ? row.status : req.body.status,
      title: req.body.title === undefined ? row.title : req.body.title,
      message: req.body.message === undefined ? row.message : req.body.message,
      metadata: req.body.metadata === undefined ? row.metadata : req.body.metadata,
    });

    return res.json({ success: true, data: { notification: SchoolStore.serializeVolunteerNotification(row) } });
  }

  async destroy(req, res) {
    const deleted = await SchoolStore.VolunteerNotification.destroy({ where: ownerWhere(req, { id: req.params.id }) });
    if (!deleted) return res.status(404).json({ success: false, error: 'Notification not found' });
    return res.json({ success: true, data: { deleted: true } });
  }

  async mark_read(req, res) {
    const row = await SchoolStore.VolunteerNotification.findOne({ where: ownerWhere(req, { id: req.params.id }) });
    if (!row) return res.status(404).json({ success: false, error: 'Notification not found' });
    await row.update({ status: 'read', readAt: new Date() });
    return res.json({ success: true, data: { notification: SchoolStore.serializeVolunteerNotification(row) } });
  }

  async mark_all_read(req, res) {
    await SchoolStore.VolunteerNotification.update(
      { status: 'read', readAt: new Date() },
      { where: ownerWhere(req, { status: 'unread' }) }
    );
    return res.json({ success: true, data: { updated: true } });
  }
}

module.exports = new VolunteerNotificationController();
