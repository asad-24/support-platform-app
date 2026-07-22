'use strict';

const nodemailer = require('nodemailer');
const config = require('@core/util/functions/config');

const fakeDeliveries = [];

function transportConfig() {
  const mail = config('mail', {});
  if (mail.transport === 'fake') return null;
  if (!mail.smtp || !mail.smtp.host) {
    return { jsonTransport: true };
  }

  const auth = mail.smtp.user
    ? { user: mail.smtp.user, pass: mail.smtp.pass || '' }
    : undefined;

  return {
    host: mail.smtp.host,
    port: Number(mail.smtp.port || 587),
    secure: Boolean(mail.smtp.secure),
    ...(auth ? { auth } : {}),
  };
}

class EmailJob {
  constructor(data) {
    this.data = data;
  }

  async run() {
    const payload = {
      from: this.data?.from || config('mail.from', 'School Support Atlas <info@schoolsupportatlas.com>'),
      to: this.data?.to,
      subject: this.data?.subject || 'School Support Atlas account update',
      text: this.data?.text || '',
      html: this.data?.html || undefined,
    };

    if (config('mail.transport') === 'fake') {
      fakeDeliveries.push(payload);
      return { sent: true, fake: true, to: payload.to };
    }

    const transport = nodemailer.createTransport(transportConfig());
    const info = await transport.sendMail(payload);
    return {
      sent: true,
      to: payload.to,
      messageId: info.messageId || null,
      response: info.response || null,
    };
  }

  static fakeDeliveries() {
    return fakeDeliveries;
  }

  static resetFakeDeliveries() {
    fakeDeliveries.splice(0, fakeDeliveries.length);
  }
}

module.exports = EmailJob;
