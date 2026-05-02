const { Sequelize } = require('sequelize');
const SQL = require('../../core/util/classes/SQL');

describe('core/classes/SQL', () => {
  let sequelize;
  let sql;

  beforeAll(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    sql = new SQL({ sequelize });
    await sequelize.query(`
      CREATE TABLE school_test_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('performs insert, select, find, update, count, and delete', async () => {
    await sql.insert('school_test_records', { name: 'Alpha', status: 'pending', count: 1 });
    await sql.insert('school_test_records', { name: 'Beta', status: 'approved', count: 2 });

    const pending = await sql.select('school_test_records', {
      columns: ['id', 'name', 'status'],
      where: { status: 'pending' },
      order: [['id', 'ASC']],
    });
    expect(pending).toHaveLength(1);
    expect(pending[0].name).toBe('Alpha');

    const found = await sql.find('school_test_records', pending[0].id);
    expect(found.status).toBe('pending');

    await sql.update('school_test_records', { status: 'approved', count: 3 }, { where: { id: pending[0].id } });
    const approvedCount = await sql.count('school_test_records', { where: { status: 'approved' } });
    expect(approvedCount).toBe(2);

    await sql.delete('school_test_records', { where: { name: { $like: 'B%' } } });
    const rows = await sql.select('school_test_records', { order: [['id', 'ASC']] });
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Alpha');
    expect(rows[0].count).toBe(3);
  });

  test('requires where clauses for destructive operations by default', async () => {
    await expect(sql.update('school_test_records', { status: 'rejected' })).rejects.toThrow(/where clause/);
    await expect(sql.delete('school_test_records')).rejects.toThrow(/where clause/);
  });

  test('rejects unsafe identifiers', async () => {
    await expect(sql.select('school_test_records; DROP TABLE users')).rejects.toThrow(/Unsafe SQL identifier/);
  });
});
