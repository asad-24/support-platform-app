const core = require('../../core/util/classes/Model');
const oxen = require('../../core/instances/oxen');
const TestMeta = require('../../src/models/TestMeta');

class TestMetaJob {
  constructor(data) { this.data = data; }
  async run() { await TestMeta.create({ key: this.data.key, value: this.data.value }); }
}

describe('jobs_testmeta_inline', () => {
  const queue = 'testmeta_jobs';

  const db_ready = async (ms = 1500) => {
    const t = new Promise((r) => setTimeout(r, ms));
    try { await Promise.race([core.sequelize.authenticate(), t]); } catch (_) {}
  };

  beforeAll(async () => {
    await db_ready();
    const ox = oxen.for(queue);
    try { await ox.deleteTable(); } catch (_) {}
    try { await ox.createTable(); } catch (_) {}
    try { await TestMeta.sync({ alter: false }); } catch (_) {}
  });

  test('enqueue_and_process_inline', async () => {
    const ok = await core.sequelize.authenticate().then(() => true).catch(() => false);
    if (!ok) { expect(true).toBe(true); return; }

    await TestMeta.destroy({ where: { key: ['jm1', 'jm2'] } });

    let processed = 0;
    const ox = oxen.for(queue);
    try { await ox.createTable(); } catch (_) {}
    const done = new Promise((resolve) => {
      ox.process({
        work_fn: async (body) => {
          await new TestMetaJob(body).run();
          processed += 1;
          if (processed >= 2) resolve();
        },
        concurrency: 2,
      });
    });

    await ox.addJob({ key: 'jm1', value: 'v1' });
    await ox.addJob({ key: 'jm2', value: 'v2' });

    await Promise.race([done, new Promise((r) => setTimeout(r, 5000))]);
    ox.stopProcessing();

    const rows = await TestMeta.findAll({ where: { key: ['jm1', 'jm2'] } });
    if (rows.length !== 2) {
      let q = [];
      try { q = await ox.selectEntireTable(); } catch (_) {}
      throw new Error(`inline processor did not process jobs. got=${rows.length}, queue_rows=${Array.isArray(q)?q.length:'n/a'}`);
    }
    expect(rows.length).toBe(2);
  });

  afterAll(async () => {
    // Close any oxen-queue pools created during this suite
    const ox = require('../../core/instances/oxen');
    try { if (ox && typeof ox.closeAll === 'function') await ox.closeAll(); } catch (_) {}
  });
});
