'use strict';

const ox = require('@core/instances/oxen');
const EmailJob = require('@src/jobs/EmailJob');

ox.process(
  'email_jobs',
  async (job) => {
    const email_job = new EmailJob(job.payload);
    const result = await email_job.run();
    return result;
  },
  { concurrency: 2 }
);

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

