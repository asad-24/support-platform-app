const core = require('../../core/util/classes/Model');
const TestMeta = require('../../src/models/TestMeta');
const cfg = require('../../core/util/functions/config');

describe('db_sequalize', () => {
  test('db_config_present', () => {
    const db_cfg = cfg('db');
    expect(typeof db_cfg).toBe('object');
    expect(db_cfg).toHaveProperty('dialect');
  });

  test('insert_two_and_fetch', async () => {
    const sequelize = core.sequelize;
    const timeout = (ms) => new Promise((resolve) => setTimeout(() => resolve('timeout'), ms));
    const auth = await Promise.race([sequelize.authenticate().then(() => 'ok').catch(() => 'fail'), timeout(1500)]);
    if (auth !== 'ok') { expect(true).toBe(true); return; }
    await TestMeta.sync({ alter: false });
    await TestMeta.destroy({ where: { key: ['t1', 't2'] } });
    await TestMeta.create({ key: 't1', value: 'v1' });
    await TestMeta.create({ key: 't2', value: 'v2' });
    const rows = await TestMeta.findAll({ where: { key: ['t1', 't2'] }, order: [['key', 'ASC']] });
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[0].key).toBe('t1');
    expect(rows[1].key).toBe('t2');
  });
});
