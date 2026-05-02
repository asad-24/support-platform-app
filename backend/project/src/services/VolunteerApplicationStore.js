'use strict';

const crypto = require('node:crypto');
const VolunteerApplication = require('@src/models/VolunteerApplication');
const User = require('@src/models/User');
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
  ];

  const payload = {};
  for (const [camel, snake] of map) {
    const value = pick(body, camel, snake);
    if (value !== undefined) payload[camel] = typeof value === 'string' ? value.trim() : value;
  }
  if (payload.email) payload.email = normalizeEmail(payload.email);
  return payload;
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

  return VolunteerApplication.create({
    ...payload,
    requestId: requestId(),
    status: 'pending',
  });
}

module.exports = {
  create,
  normalizePayload,
  validate,
};
