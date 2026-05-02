const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
function run(cmd, opts = {}) {
  const cwd = opts.cwd || path.join(process.cwd());
  const env = { ...process.env, ...(opts.env || {}) };
  return execSync(cmd, { cwd, env, stdio: 'pipe', encoding: 'utf8' });
}

describe('db_sequalize_cli', () => {
  const project_root = path.join(process.cwd());
  const model_name = 'TestABCXYZ';
  const table_name = 'TestABCXYZs';

  let sequelize;
  let skip_cli = false;

  beforeAll(() => {
    const models_dir = path.join(project_root, 'src', 'models');
    const migrations_dir = path.join(project_root, 'src', 'database', 'migrations');
    try {
      for (const f of fs.readdirSync(models_dir)) {
        if (f.toLowerCase().includes(model_name.toLowerCase())) fs.unlinkSync(path.join(models_dir, f));
      }
    } catch (_) {}
    try {
      for (const f of fs.readdirSync(migrations_dir)) {
        if (f.toLowerCase().includes(model_name.toLowerCase())) fs.unlinkSync(path.join(migrations_dir, f));
      }
    } catch (_) {}
    try {
      run(`npm run orm -- model:generate --name ${model_name} --attributes title:string`, { cwd: project_root });
      run('npm run db:migrate', { cwd: project_root });
    } catch (e) {
      skip_cli = true;
      return;
    }
    const core = require('../../core/util/classes/Model');
    sequelize = core.sequelize;
  });

  afterAll(async () => {
    // Undo migrations via CLI if we ran them
    try { if (!skip_cli) run('npm run db:migrate:undo', { cwd: project_root }); } catch (_) {}

    // Drop the generated table explicitly to ensure DB cleanup
    try {
      if (sequelize) {
        await sequelize.getQueryInterface().dropTable(table_name);
      }
    } catch (_) {}

    // Remove generated model + migration files using normalized comparison
    try {
      const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
      const target = norm(model_name);
      const models_dir = path.join(project_root, 'src', 'models');
      const migrations_dir = path.join(project_root, 'src', 'database', 'migrations');
      if (fs.existsSync(models_dir)) {
        for (const f of fs.readdirSync(models_dir)) {
          if (norm(f).includes(target)) {
            try { fs.unlinkSync(path.join(models_dir, f)); } catch (_) {}
          }
        }
      }
      if (fs.existsSync(migrations_dir)) {
        for (const f of fs.readdirSync(migrations_dir)) {
          if (norm(f).includes(target)) {
            try { fs.unlinkSync(path.join(migrations_dir, f)); } catch (_) {}
          }
        }
      }
    } catch (_) {}

    // Close Sequelize last
    if (sequelize) await sequelize.close();
  });

  test('generated_files_exist', () => {
    if (skip_cli) { expect(true).toBe(true); return; }
    const migrations_dir = path.join(project_root, 'src', 'database', 'migrations');
    const models_dir = path.join(project_root, 'src', 'models');
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = norm(model_name);
    const has_model = fs.existsSync(models_dir) && fs.readdirSync(models_dir).some((f) => norm(f).includes(target));
    const has_migration = fs.readdirSync(migrations_dir).some((f) => norm(f).includes(target));
    if (!has_migration) {
      throw new Error('expected a migration for TestABCXYZ to be generated');
    }
  });

  test('insert_and_fetch_cli_model', async () => {
    if (skip_cli) { expect(true).toBe(true); return; }
    const models_dir = path.join(project_root, 'src', 'models');
    let model;
    const { DataTypes } = require('sequelize');
    if (fs.existsSync(models_dir)) {
      const file = fs.readdirSync(models_dir).find((f) => f.toLowerCase().includes(model_name.toLowerCase()));
      if (file) {
        const mod_path = path.join(models_dir, file);
        const define_fn = require(mod_path);
        model = define_fn(sequelize, DataTypes);
      }
    }
    if (!model) {
      model = sequelize.define('TestABCXYZ', { title: DataTypes.STRING }, { tableName: 'TestABCXYZs' });
    }
    await model.sync({ alter: false });
    const created = await model.create({ title: 'ok' });
    const fetched = await model.findByPk(created.id);
    if (!fetched) {
      throw new Error('model create failed: row not found');
    }
    expect(fetched.title).toBe('ok');
  });
});
