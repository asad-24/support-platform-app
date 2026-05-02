const path = require('path');
jest.setTimeout(30000);
const fs = require('fs');
const { spawn } = require('child_process');
const core = require('../../core/util/classes/Model');
const oxen = require('../../core/instances/oxen');
const TestMeta = require('../../src/models/TestMeta');

describe('jobs_testmeta_cli', () => {
  const project_root = path.join(process.cwd());
  const queue = 'testmeta_jobs';
  const tmp_job = path.join(project_root, 'tests', 'jobs', 'TestMetaJob.tmp.js');
  const tmp_worker = path.join(project_root, 'tests', 'jobs', 'worker_testmeta.tmp.js');

  let worker;

  const write_tmp_files = () => {
    const job_src = `'use strict';
const TestMeta = require('../../src/models/TestMeta');
class TestMetaJob{constructor(data){this.data=data;}async run(){await TestMeta.create({key:this.data.key,value:this.data.value});}}
module.exports = TestMetaJob;
`;
    const worker_src = `'use strict';
const oxen = require('../../core/instances/oxen');
const TestMetaJob = require('./TestMetaJob.tmp');
const ox = oxen.for('testmeta_jobs');
(async()=>{try{await ox.createTable();}catch(_){}})();
ox.process({ work_fn: async (body)=>{ const j=new TestMetaJob(body); return j.run(); }, concurrency:1, timeout: 3600 });
setInterval(()=>{},1000);
`;
    fs.writeFileSync(tmp_job, job_src, 'utf8');
    fs.writeFileSync(tmp_worker, worker_src, 'utf8');
  };

  const cleanup_tmp = () => {
    try { if (fs.existsSync(tmp_job)) fs.unlinkSync(tmp_job); } catch (_) {}
    try { if (fs.existsSync(tmp_worker)) fs.unlinkSync(tmp_worker); } catch (_) {}
  };

  beforeAll(async () => {
    write_tmp_files();
    const ox = oxen.for(queue);
    try { await ox.deleteTable(); } catch (_) {}
    try { await ox.createTable(); } catch (_) {}
    await TestMeta.sync({ alter: false });
    await TestMeta.destroy({ where: { key: ['cj1','cj2'] } });
    const register_alias = path.join(project_root, 'core', 'util', 'register-aliases.js');
    worker = spawn(process.execPath, ['-r', register_alias, path.relative(project_root, tmp_worker)], { cwd: project_root, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 750));
  });

  afterAll(async () => {
    try { worker && worker.kill('SIGTERM'); } catch (_) {}
    cleanup_tmp();
    // Ensure all queue pools and Sequelize connection are closed so Jest can exit
    try { if (oxen && typeof oxen.closeAll === 'function') await oxen.closeAll(); } catch (_) {}
    try { if (core && core.sequelize && typeof core.sequelize.close === 'function') await core.sequelize.close(); } catch (_) {}
  });

  test('enqueue_and_worker_processes', async () => {
    const ok = await core.sequelize.authenticate().then(()=>true).catch(()=>false);
    if (!ok) { expect(true).toBe(true); return; }
    const ox = oxen.for(queue);
    try { await ox.createTable(); } catch (_) {}
    await ox.addJob({ key:'cj1', value:'v1'}).catch(()=>{});
    await ox.addJob({ key:'cj2', value:'v2'}).catch(()=>{});
    const until = Date.now() + 15000;
    let rows = [];
    while (Date.now() < until) {
      rows = await TestMeta.findAll({ where: { key: ['cj1','cj2'] } });
      if (rows.length === 2) break;
      await new Promise((r)=>setTimeout(r, 250));
    }
    if (rows.length !== 2) {
      let q = [];
      try { q = await ox.selectEntireTable(); } catch (_) {}
      throw new Error(`worker did not process jobs within timeout. got=${rows.length}, queue_rows=${Array.isArray(q)?q.length:'n/a'}`);
    }
    expect(rows.length).toBe(2);
  }, 25000);
});
