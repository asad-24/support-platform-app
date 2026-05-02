Jobs & Queues (Oxen)

- Queue library: `oxen-queue`
- Shared instance: `core/instances/oxen.js`
- Jobs: `src/jobs/`
- Workers: `src/workers/`
- Queue table: `oxen_queue` (migration provided)

Config

- Uses the app DB config from `src/config/db.js` via the shared instance.
- No separate config files; environment vars are respected by `config('db')`.

Key Files

- `core/instances/oxen.js`: exports a singleton Oxen instance configured from `config('db')` and table `oxen_queue`.
- `src/jobs/EmailJob.js`: example job class with `run()`.
- `src/workers/email_worker.js`: worker that processes the `email_jobs` queue with `concurrency: 2`.
- `src/database/migrations/20250916123000-create-oxen-queue.js`: creates the `oxen_queue` table.

CLI & Scripts

- Run worker (project script): `npm run queue:worker:email`
- Run worker (direct): `node -r ./core/util/register-aliases.js src/workers/email_worker.js`
- Oxen CLI example: `npx oxen-queue worker --queue email_jobs`
- Migrate table: `npm run db:migrate`

Create a Job

- Add a file under `src/jobs/` exporting a class with a `run()` method.
- Example enqueue (e.g., in a controller):
  - `const ox = require('@core/instances/oxen');`
  - `const EmailJob = require('@src/jobs/EmailJob');`
  - `await ox.addJob(new EmailJob({ to, subject, body }), 'email_jobs');`

Process Jobs

- Worker (see `src/workers/email_worker.js`):
  - `ox.process('email_jobs', async (job) => { /* run */ }, { concurrency: 2 });`

Table Schema

- Table name: `oxen_queue`
- Columns: `id`, `job_type`, `payload` (JSON), `status` (`pending|processing|done|failed`), timestamps.
- Managed by migration; Oxen instance points to this table.

Notes

- The shared instance avoids re-creating connections per enqueue.
- The worker can be scaled by running multiple processes or increasing `concurrency`.
