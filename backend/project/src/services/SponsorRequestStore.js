'use strict';

const crypto = require('node:crypto');
const config = require('@core/util/functions/config');
const SponsorRequest = require('@src/models/SponsorRequest');
const AdminNotification = require('@src/models/AdminNotification');
const EmailJob = require('@src/jobs/EmailJob');

const HELP_TYPES = new Set(['Donate Money', 'Send Items', 'Sponsor Monthly', 'Visit/Partner']);
const STATUSES = new Set(['new', 'contacted', 'committed', 'declined', 'closed']);

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requestId() {
  return `sponsor-request-${crypto.randomBytes(4).toString('hex')}`;
}

function normalizeNeed(need) {
  if (typeof need === 'string') {
    return { id: need, title: need, category: null, estimatedCost: null };
  }
  if (!need || typeof need !== 'object') return null;
  return {
    id: readString(need.id),
    title: readString(need.title) || readString(need.id),
    category: readString(need.category) || null,
    estimatedCost: need.estimatedCost === undefined || need.estimatedCost === null || need.estimatedCost === ''
      ? null
      : Number(need.estimatedCost),
  };
}

function normalizePayload(body = {}) {
  const selectedNeeds = Array.isArray(body.selectedNeeds)
    ? body.selectedNeeds.map(normalizeNeed).filter(Boolean)
    : [];
  const pledgeRaw = readString(body.pledgeAmount);
  const pledgeAmount = pledgeRaw ? Number(pledgeRaw.replace(/,/g, '')) : null;

  return {
    sponsorName: readString(body.sponsorName || body.donorName),
    sponsorEmail: readString(body.sponsorEmail || body.donorEmail).toLowerCase(),
    sponsorPhone: readString(body.sponsorPhone || body.donorPhone),
    sponsorCountry: readString(body.sponsorCountry || body.donorCountry),
    organizationName: readString(body.organizationName) || null,
    preferredHelpType: readString(body.preferredHelpType),
    pledgeAmount: Number.isFinite(pledgeAmount) ? pledgeAmount : null,
    helpDetails: readString(body.helpDetails),
    message: readString(body.message),
    schoolId: readString(body.schoolId),
    schoolName: readString(body.schoolName),
    selectedNeeds,
    profileLink: readString(body.profileLink) || null,
  };
}

function validate(payload) {
  const fields = {};
  if (!payload.sponsorName) fields.sponsorName = 'Full name is required';
  if (!payload.sponsorEmail) fields.sponsorEmail = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.sponsorEmail)) fields.sponsorEmail = 'Enter a valid email address';
  if (!payload.sponsorPhone) fields.sponsorPhone = 'Phone or WhatsApp is required';
  if (!payload.sponsorCountry) fields.sponsorCountry = 'Country is required';
  if (!HELP_TYPES.has(payload.preferredHelpType)) fields.preferredHelpType = 'Choose how you can help';
  if (!payload.helpDetails || payload.helpDetails.length < 2) fields.helpDetails = 'Share the amount, items, or support details';
  if (!payload.message || payload.message.length < 3) fields.message = 'Message is required';
  if (!payload.schoolId) fields.schoolId = 'School is required';
  if (!payload.schoolName) fields.schoolName = 'School name is required';
  if (!payload.selectedNeeds.length) fields.selectedNeeds = 'Select at least one need';
  return fields;
}

function serialize(row) {
  if (!row) return null;
  const data = typeof row.toJSON === 'function' ? row.toJSON() : row;
  return {
    id: data.id,
    requestId: data.requestId,
    sponsorName: data.sponsorName,
    sponsorEmail: data.sponsorEmail,
    sponsorPhone: data.sponsorPhone,
    sponsorCountry: data.sponsorCountry,
    organizationName: data.organizationName,
    preferredHelpType: data.preferredHelpType,
    pledgeAmount: data.pledgeAmount,
    helpDetails: data.helpDetails,
    message: data.message,
    schoolId: data.schoolId,
    schoolName: data.schoolName,
    selectedNeeds: Array.isArray(data.selectedNeeds) ? data.selectedNeeds : [],
    profileLink: data.profileLink,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function sponsorEmail(request) {
  const needs = request.selectedNeeds.map((need) => need.title || need.id).join(', ');
  const amount = request.pledgeAmount ? `\nPledge amount: ${request.pledgeAmount}` : '';
  const text = [
    'New sponsor request submitted on School Support Atlas.',
    '',
    `Sponsor: ${request.sponsorName}`,
    `Email: ${request.sponsorEmail}`,
    `Phone: ${request.sponsorPhone}`,
    `Country: ${request.sponsorCountry}`,
    `Organization: ${request.organizationName || 'Not provided'}`,
    `Help type: ${request.preferredHelpType}`,
    `School: ${request.schoolName}`,
    `Need: ${needs}`,
    `Profile: ${request.profileLink || 'Not provided'}`,
    `Help details: ${request.helpDetails}${amount}`,
    '',
    request.message,
  ].join('\n');

  const html = `
    <p>New sponsor request submitted on School Support Atlas.</p>
    <ul>
      <li><strong>Sponsor:</strong> ${escapeHtml(request.sponsorName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(request.sponsorEmail)}</li>
      <li><strong>Phone:</strong> ${escapeHtml(request.sponsorPhone)}</li>
      <li><strong>Country:</strong> ${escapeHtml(request.sponsorCountry)}</li>
      <li><strong>Organization:</strong> ${escapeHtml(request.organizationName || 'Not provided')}</li>
      <li><strong>Help type:</strong> ${escapeHtml(request.preferredHelpType)}</li>
      <li><strong>School:</strong> ${escapeHtml(request.schoolName)}</li>
      <li><strong>Need:</strong> ${escapeHtml(needs)}</li>
      <li><strong>Profile:</strong> ${escapeHtml(request.profileLink || 'Not provided')}</li>
      <li><strong>Help details:</strong> ${escapeHtml(request.helpDetails)}</li>
      ${request.pledgeAmount ? `<li><strong>Pledge amount:</strong> ${escapeHtml(request.pledgeAmount)}</li>` : ''}
    </ul>
    <p>${escapeHtml(request.message).replace(/\n/g, '<br>')}</p>
  `;

  return {
    to: config('mail.adminNotificationEmail', 'contact@schoolsupportatlas.com'),
    subject: `New sponsor request for ${request.schoolName}`,
    text,
    html,
  };
}

async function create(body = {}) {
  const payload = normalizePayload(body);
  const fields = validate(payload);
  if (Object.keys(fields).length) {
    const error = new Error('Please complete all required fields.');
    error.status = 422;
    error.code = 'VALIDATION_ERROR';
    error.fields = fields;
    throw error;
  }

  const row = await SponsorRequest.create({
    ...payload,
    requestId: requestId(),
    status: 'new',
  });
  const data = serialize(row);

  await AdminNotification.create({
    actorUserId: null,
    schoolId: null,
    type: 'sponsor_request_received',
    title: 'New sponsor request',
    message: `${data.sponsorName} wants to support ${data.schoolName}.`,
    status: 'unread',
    metadata: {
      sponsorRequestId: data.id,
      requestId: data.requestId,
      sponsorEmail: data.sponsorEmail,
      schoolId: data.schoolId,
      schoolName: data.schoolName,
    },
  });

  await new EmailJob(sponsorEmail(data)).run();
  return row;
}

async function list(query = {}) {
  const where = {};
  if (query.status) {
    const status = readString(query.status).toLowerCase();
    if (STATUSES.has(status)) where.status = status;
  }
  const limit = Math.max(1, Math.min(Number(query.limit) || 50, 100));
  const page = Math.max(1, Number(query.page) || 1);
  const { rows, count } = await SponsorRequest.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });
  return {
    items: rows.map(serialize),
    pagination: { total: count, page, limit },
  };
}

async function get(id) {
  const row = await SponsorRequest.findByPk(id);
  if (!row) {
    const error = new Error('Sponsor request not found.');
    error.status = 404;
    error.code = 'SPONSOR_REQUEST_NOT_FOUND';
    throw error;
  }
  return row;
}

async function updateStatus(id, status) {
  const nextStatus = readString(status).toLowerCase();
  if (!STATUSES.has(nextStatus)) {
    const error = new Error('Invalid sponsor request status.');
    error.status = 422;
    error.code = 'VALIDATION_ERROR';
    error.fields = { status: 'Choose a valid status' };
    throw error;
  }
  const row = await get(id);
  await row.update({ status: nextStatus });

  if (nextStatus !== 'new') {
    const notifications = await AdminNotification.findAll({
      where: { type: 'sponsor_request_received', status: 'unread' },
      order: [['createdAt', 'DESC']],
    });
    const notification = notifications.find((item) => Number(item.metadata?.sponsorRequestId) === Number(row.id));
    if (notification) {
      await notification.update({ status: 'resolved', readAt: notification.readAt || new Date(), resolvedAt: new Date() });
    }
  }

  return row;
}

module.exports = {
  HELP_TYPES,
  STATUSES,
  create,
  get,
  list,
  normalizePayload,
  serialize,
  updateStatus,
  validate,
};
