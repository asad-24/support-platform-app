'use strict';

const config = require('@core/util/functions/config');
const EmailJob = require('@src/jobs/EmailJob');

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

function validate(payload) {
  const fields = {};
  if (!payload.name) fields.name = 'Name is required';
  if (!payload.email) fields.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) fields.email = 'Enter a valid email address';
  if (!payload.subject) fields.subject = 'Subject is required';
  if (!payload.message || payload.message.length < 3) fields.message = 'Message is required';
  return fields;
}

async function create(body = {}) {
  const payload = {
    name: readString(body.name),
    email: readString(body.email).toLowerCase(),
    subject: readString(body.subject),
    message: readString(body.message),
  };

  const fields = validate(payload);
  if (Object.keys(fields).length) {
    const error = new Error('Please complete all required fields.');
    error.status = 422;
    error.code = 'VALIDATION_ERROR';
    error.fields = fields;
    throw error;
  }

  const text = [
    'New contact message from School Support Atlas.',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    '',
    payload.message,
  ].join('\n');

  const html = `
    <p>New contact message from School Support Atlas.</p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(payload.name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(payload.email)}</li>
      <li><strong>Subject:</strong> ${escapeHtml(payload.subject)}</li>
    </ul>
    <p>${escapeHtml(payload.message).replace(/\n/g, '<br>')}</p>
  `;

  await new EmailJob({
    to: config('mail.adminNotificationEmail', 'contact@schoolsupportatlas.com'),
    subject: `Contact form: ${payload.subject}`,
    text,
    html,
  }).run();

  return { sent: true };
}

module.exports = {
  create,
  validate,
};
