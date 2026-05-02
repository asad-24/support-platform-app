ORM Overview

- Models: `src/models/`
- Migrations: `src/database/migrations/`
- Seeders: `src/database/seeders/`
- Config: `src/config/db.js` (single source)
- CLI: `npm run orm` (sequelize-cli), DB scripts in package.json

Config

- All database settings come from `src/config/db.js` and env vars.
- The app and CLI use the same config via `.sequelizerc`.

Model Usage

- Create a class per model in `src/models/` and initialize it with the shared Sequelize instance.
- Import directly where needed: `const TestMeta = require('@src/models/TestMeta')`.

CLI Commands

- Generate model + migration: `npm run orm -- model:generate --name Product --attributes name:string,price:float`
- Generate migration only: `npm run orm -- migration:generate --name add-index`
- Run migrations: `npm run db:migrate`
- Undo all migrations: `npm run db:migrate:undo`
- Run all seeders: `npm run db:seed`
- Undo last seeder: `npm run db:seed:undo`

Migrations

- Place files under `src/database/migrations/`.
- Use `queryInterface` to create/alter/drop tables.

Seeders

- Place files under `src/database/seeders/`.
- Use `bulkInsert` and `bulkDelete` to seed and revert.

Conventions

- Keep models class-based and import directly.
- Use one DB config across environments.
