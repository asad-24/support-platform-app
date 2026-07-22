'use strict';

const crypto = require('node:crypto');
const VolunteerApplication = require('@src/models/VolunteerApplication');
const User = require('@src/models/User');
const AdminNotification = require('@src/models/AdminNotification');
const AuthStore = require('@src/services/AuthStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');
const EmailJob = require('@src/jobs/EmailJob');
const { normalizeEmail } = require('@src/services/auth/credentials');

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'state',
  'lga',
  'address',
  'educationLevel',
  'occupation',
  'skills',
  'volunteerExperience',
  'availability',
  'volunteeringMode',
  'motivation',
  'emergencyContactName',
  'emergencyContactPhone',
];

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pick(body, camel, snake = null) {
  if (!body || typeof body !== 'object') return undefined;
  if (body[camel] !== undefined) return body[camel];
  if (snake && body[snake] !== undefined) return body[snake];
  return undefined;
}

function normalizePayload(body = {}) {
  const map = [
    ['fullName', 'full_name'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['dateOfBirth', 'date_of_birth'],
    ['gender', 'gender'],
    ['state', 'state'],
    ['lga', 'lga'],
    ['address', 'address'],
    ['educationLevel', 'education_level'],
    ['occupation', 'occupation'],
    ['skills', 'skills'],
    ['volunteerExperience', 'volunteer_experience'],
    ['availability', 'availability'],
    ['volunteeringMode', 'volunteering_mode'],
    ['motivation', 'motivation'],
    ['emergencyContactName', 'emergency_contact_name'],
    ['emergencyContactPhone', 'emergency_contact_phone'],
    ['password', 'password'],
  ];

  const payload = {};
  for (const [camel, snake] of map) {
    const value = pick(body, camel, snake);
    if (value !== undefined) payload[camel] = typeof value === 'string' ? value.trim() : value;
  }
  if (payload.email) payload.email = normalizeEmail(payload.email);
  return payload;
}

function sanitizeUsernameBase(value) {
  const base = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
  return base || 'volunteer';
}

async function generateUsername(application) {
  const emailLocal = String(application.email || '').split('@')[0];
  const base = sanitizeUsernameBase(application.fullName || emailLocal);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const username = attempt === 0 ? base : `${base}_${attempt + 1}`;
    const existing = await User.findOne({ where: { username } });
    if (!existing) return username;
  }
  return `${base}_${crypto.randomBytes(3).toString('hex')}`;
}

function generateTemporaryPassword() {
  return `Temp@${crypto.randomBytes(6).toString('hex')}`;
}

function approvalEmail({ application, username, password }) {
  const text = [
    `Hello ${application.fullName},`,
    '',
    'Your School Support Atlas volunteer registration request has been approved.',
    '',
    'Use these credentials to sign in to the Flutter app:',
    `Email: ${application.email}`,
    `Username: ${username}`,
    `Temporary password: ${password}`,
    '',
    'Please change your password after signing in.',
    '',
    'School Support Atlas Admin Team',
  ].join('\n');

  const html = `
    <p>Hello ${application.fullName},</p>
    <p>Your School Support Atlas volunteer registration request has been approved.</p>
    <p>Use these credentials to sign in to the Flutter app:</p>
    <ul>
      <li><strong>Email:</strong> ${application.email}</li>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Temporary password:</strong> ${password}</li>
    </ul>
    <p>Please change your password after signing in.</p>
    <p>School Support Atlas Admin Team</p>
  `;

  return {
    to: application.email,
    subject: 'Your School Support Atlas volunteer account is approved',
    text,
    html,
  };
}

function profilePayloadFromApplication(application) {
  return {
    fullName: application.fullName,
    phone: application.phone,
    state: application.state,
    lga: application.lga,
    address: application.address,
    dateOfBirth: application.dateOfBirth,
    gender: application.gender,
    educationLevel: application.educationLevel,
    occupation: application.occupation,
    skills: application.skills,
    volunteerExperience: application.volunteerExperience,
    availability: application.availability,
    volunteeringMode: application.volunteeringMode,
    motivation: application.motivation,
    emergencyContactName: application.emergencyContactName,
    emergencyContactPhone: application.emergencyContactPhone,
  };
}

function validate(payload) {
  const fields = {};
  for (const field of REQUIRED_FIELDS) {
    if (!readString(payload[field])) fields[field] = 'This field is required';
  }
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    fields.email = 'Enter a valid email address';
  }
  return fields;
}

function requestId() {
  return `volunteer-request-${crypto.randomBytes(4).toString('hex')}`;
}

async function create(body = {}) {
  const payload = normalizePayload(body);
  const fields = validate(payload);
  if (Object.keys(fields).length) {
    const error = new Error('Please correct the highlighted fields.');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.fields = fields;
    throw error;
  }

  const existingUser = await User.findOne({ where: { email: payload.email } });
  if (existingUser) {
    const error = new Error('An account already exists for this email.');
    error.status = 409;
    error.code = 'EMAIL_TAKEN';
    error.fields = { email: 'An account already exists for this email' };
    throw error;
  }

  const existingApplication = await VolunteerApplication.findOne({
    where: { email: payload.email, status: 'pending' },
  });
  if (existingApplication) {
    const error = new Error('A pending application already exists for this email.');
    error.status = 409;
    error.code = 'APPLICATION_EXISTS';
    error.fields = { email: 'A pending application already exists for this email' };
    throw error;
  }

  const application = await VolunteerApplication.create({
    ...payload,
    requestId: requestId(),
    status: 'pending',
  });

  await AdminNotification.create({
    actorUserId: null,
    schoolId: null,
    type: 'volunteer_application_received',
    title: 'New volunteer registration',
    message: `${application.fullName} submitted a volunteer registration request.`,
    status: 'unread',
    metadata: {
      applicationId: application.id,
      requestId: application.requestId,
      email: application.email,
    },
  });

  return application;
}

async function list(query = {}) {
  const where = {};
  if (query.status) where.status = String(query.status).trim().toLowerCase();
  return VolunteerApplication.findAll({ where, order: [['createdAt', 'DESC']] });
}

async function get(applicationId) {
  const application = await VolunteerApplication.findByPk(applicationId);
  if (!application) {
    const error = new Error('Volunteer application not found.');
    error.status = 404;
    error.code = 'APPLICATION_NOT_FOUND';
    throw error;
  }
  return application;
}

async function getPending(applicationId) {
  const application = await get(applicationId);
  if (application.status !== 'pending') {
    const error = new Error('Volunteer application has already been reviewed.');
    error.status = 409;
    error.code = 'APPLICATION_ALREADY_REVIEWED';
    throw error;
  }
  return application;
}

async function resolveApplicationNotification(application) {
  const rows = await AdminNotification.findAll({
    where: { type: 'volunteer_application_received', status: 'unread' },
    order: [['createdAt', 'DESC']],
  });
  const row = rows.find((notification) => {
    const metadata = notification.metadata || {};
    return Number(metadata.applicationId) === Number(application.id)
      || metadata.requestId === application.requestId
      || metadata.email === application.email;
  });
  if (!row) return null;
  await row.update({ status: 'resolved', readAt: row.readAt || new Date(), resolvedAt: new Date() });
  return row;
}

async function approve(applicationId, adminUserId, body = {}) {
  const application = await getPending(applicationId);
  const existingUser = await User.findOne({ where: { email: application.email } });
  if (existingUser) {
    const error = new Error('An account already exists for this application email.');
    error.status = 409;
    error.code = 'EMAIL_TAKEN';
    throw error;
  }

  const username = await generateUsername(application);
  const password = generateTemporaryPassword();
  const auth = await AuthStore.createUser({
    name: application.fullName,
    email: application.email,
    username,
    password,
    role: 'volunteer',
  });

  const profile = await ProfileStore.upsertForUser(auth.user.id, profilePayloadFromApplication(application));
  await application.update({
    status: 'approved',
    reviewedByUserId: adminUserId,
    reviewedAt: new Date(),
    adminNotes: body.adminNotes || body.notes || application.adminNotes || null,
  });
  await resolveApplicationNotification(application);
  const email = approvalEmail({ application, username, password });
  await new EmailJob(email).run();

  return {
    application,
    user: auth.user,
    profile,
    username,
  };
}

async function reject(applicationId, adminUserId, body = {}) {
  const application = await getPending(applicationId);
  await application.update({
    status: 'rejected',
    reviewedByUserId: adminUserId,
    reviewedAt: new Date(),
    adminNotes: body.adminNotes || body.notes || application.adminNotes || null,
  });
  await resolveApplicationNotification(application);
  return application;
}

module.exports = {
  approve,
  create,
  get,
  list,
  normalizePayload,
  reject,
  validate,
};
