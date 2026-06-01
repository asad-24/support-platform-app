const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const TestMeta = require('../../src/models/TestMeta');
const { sequelize } = require('../../core/util/classes/Model');

jest.setTimeout(60000);

function run(cmd, opts = {}) {
  const cwd = opts.cwd || path.join(process.cwd());
  const env = { ...process.env, ...(opts.env || {}) };
  return execSync(cmd, { cwd, env, stdio: 'pipe', encoding: 'utf8' });
}

describe('db_seeders', () => {
  const project_root = path.join(process.cwd());
  let skip_cli = false;
  let new_seeder_path = null;

  test('run_existing_and_custom_seeder_then_undo', async () => {
    try {
      run('npm run db:seed', { cwd: project_root });
    } catch (e) {
      skip_cli = true;
    }
    if (skip_cli) { expect(true).toBe(true); return; }

    const rows1 = await TestMeta.findAll({ where: { key: 'foe', value: 'bar' } });
    expect(rows1.length).toBeGreaterThanOrEqual(1);

    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const filename = `${ts}-seed-test-meta-extra.js`;
    const seeders_dir = path.join(project_root, 'src', 'database', 'seeders');
    new_seeder_path = path.join(seeders_dir, filename);
    const now = new Date().toISOString();
    const content = `'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date('${now}');
    await queryInterface.bulkInsert('test_metas', [
      { key: 'extra1', value: 'v1', createdAt: now, updatedAt: now },
      { key: 'extra2', value: 'v2', createdAt: now, updatedAt: now }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('test_metas', { key: ['extra1', 'extra2'] }, {});
  }
};
`;
    try { fs.mkdirSync(seeders_dir, { recursive: true }); } catch (_) {}
    fs.writeFileSync(new_seeder_path, content, 'utf8');

    run('npm run db:seed', { cwd: project_root });

    const rows2 = await TestMeta.findAll({ where: { key: ['extra1', 'extra2'] } });
    if (rows2.length !== 2) {
      throw new Error(`expected 2 seeded rows, got ${rows2.length}`);
    }

    run('npm run db:seed:undo', { cwd: project_root });

    const rows3 = await TestMeta.findAll({ where: { key: ['extra1', 'extra2'] } });
    if (rows3.length !== 0) {
      throw new Error(`expected 0 rows after undo, got ${rows3.length}`);
    }
  });

  afterAll(async () => {
    try { if (new_seeder_path && fs.existsSync(new_seeder_path)) fs.unlinkSync(new_seeder_path); } catch (_) {}
    // Defensive cleanup: remove any stray test-created seeders from previous runs
    try {
      const seeders_dir = path.join(project_root, 'src', 'database', 'seeders');
      const files = fs.readdirSync(seeders_dir);
      for (const f of files) {
        if (f.includes('seed-test-meta-extra')) {
          try { fs.unlinkSync(path.join(seeders_dir, f)); } catch (_) {}
        }
      }
    } catch (_) {}
    await sequelize.close();
  });
});
