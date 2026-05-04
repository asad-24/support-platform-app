process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
jest.setTimeout(60000);

const core = require('../../core/util/classes/Model');
const TestMeta = require('../../src/models/TestMeta');
const cfg = require('../../core/util/functions/config');

describe('db_mongodb', () => {
  beforeAll(async () => {
    await core.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await core.sequelize.close();
  });

  test('db_config_present', () => {
    const dbCfg = cfg('db');
    expect(typeof dbCfg).toBe('object');
    expect(dbCfg.dialect).toBe('mongodb');
  });

  test('insert_two_and_fetch', async () => {
    await core.sequelize.authenticate();
    await TestMeta.sync();
    await TestMeta.destroy({ where: { key: ['t1', 't2'] } });
    await TestMeta.create({ key: 't1', value: 'v1' });
    await TestMeta.create({ key: 't2', value: 'v2' });
    const rows = await TestMeta.findAll({ where: { key: ['t1', 't2'] }, order: [['key', 'ASC']] });
    expect(rows.map((row) => row.key)).toEqual(['t1', 't2']);
  });
});
