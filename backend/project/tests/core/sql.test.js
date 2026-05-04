process.env.MONGODB_TEST_DB_NAME = 'support_platform_app_test';
jest.setTimeout(60000);

const SQL = require('../../core/util/classes/SQL');
const { sequelize } = require('../../core/util/classes/Model');

describe('core mongo query helper', () => {
  let sql;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    sql = new SQL();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('select, update, and count support current query shapes', async () => {
    await sql.insert('school_test_records', { status: 'pending', count: 1 });
    await sql.insert('school_test_records', { status: 'draft', count: 2 });

    const pending = await sql.select('school_test_records', { where: { status: 'pending' } });
    expect(pending).toHaveLength(1);

    await sql.update('school_test_records', { status: 'approved', count: 3 }, { where: { id: pending[0].id } });
    const approvedCount = await sql.count('school_test_records', { where: { status: 'approved' } });
    expect(approvedCount).toBe(1);
  });

  test('update still requires a where clause by default', async () => {
    await expect(sql.update('school_test_records', { status: 'rejected' })).rejects.toThrow(/where clause/);
  });
});
