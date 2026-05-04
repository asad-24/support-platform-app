process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
jest.setTimeout(60000);

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const core = require('../../core/util/classes/Model');
const TestMeta = require('../../src/models/TestMeta');

function run(cmd, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const env = { ...process.env, NODE_ENV: 'test', ...(opts.env || {}) };
  return execSync(cmd, { cwd, env, stdio: 'pipe', encoding: 'utf8' });
}

describe('db_mongodb_cli', () => {
  const projectRoot = process.cwd();
  const migrationsDir = path.join(projectRoot, 'src', 'database', 'migrations');
  const tempMigration = path.join(migrationsDir, '20990101000000-test-mongo-cli.js');

  beforeAll(async () => {
    await core.sequelize.sync({ force: true });
    fs.writeFileSync(tempMigration, `'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('test_metas', [{ key: 'mongo-cli', value: 'ok' }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('test_metas', { key: 'mongo-cli' });
  },
};
`, 'utf8');
  });

  afterAll(async () => {
    try { if (fs.existsSync(tempMigration)) fs.unlinkSync(tempMigration); } catch (_) {}
    await core.sequelize.close();
  });

  test('mongo migration scripts run and undo', async () => {
    run('npm run db:migrate', { cwd: projectRoot });
    let rows = await TestMeta.findAll({ where: { key: 'mongo-cli' } });
    expect(rows).toHaveLength(1);

    run('npm run db:migrate:undo', { cwd: projectRoot });
    rows = await TestMeta.findAll({ where: { key: 'mongo-cli' } });
    expect(rows).toHaveLength(0);
  });
});
