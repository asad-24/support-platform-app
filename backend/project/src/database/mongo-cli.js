'use strict';

const fs = require('fs');
const path = require('path');
const MongoDB = require('@core/util/classes/MongoDB');
const { MongoModel, DataTypes } = require('@core/util/classes/MongoModel');

DataTypes.literal = (value) => value;

function loadModels() {
  const modelsDir = path.resolve(__dirname, '..', 'models');
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith('.js')) require(path.join(modelsDir, file));
  }
}

function snakeToCamel(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizeDocument(row = {}) {
  const doc = {};
  for (const [key, value] of Object.entries(row)) {
    doc[snakeToCamel(key)] = value;
  }
  return doc;
}

class MongoQueryInterface {
  constructor(db) {
    this.db = db;
  }

  async createTable(name) {
    const names = await this.db.listCollections({}, { nameOnly: true }).toArray();
    if (!names.some((item) => item.name === name)) await this.db.createCollection(name);
    await this.db.collection(name).createIndex({ id: 1 }, { unique: true });
  }

  async dropTable(name) {
    await this.db.collection(name).drop().catch(() => null);
  }

  async addColumn() {}
  async removeColumn() {}

  async addIndex(table, columns, options = {}) {
    const keys = {};
    for (const column of columns) keys[snakeToCamel(column)] = 1;
    try {
      await this.db.collection(table).createIndex(keys, {
        unique: Boolean(options.unique),
        sparse: Boolean(options.unique),
        name: options.name,
      });
    } catch (error) {
      if (error && error.code === 85) return;
      throw error;
    }
  }

  async removeIndex(table, nameOrColumns) {
    const collection = this.db.collection(table);
    if (Array.isArray(nameOrColumns)) {
      const keys = {};
      for (const column of nameOrColumns) keys[snakeToCamel(column)] = 1;
      const indexes = await collection.indexes();
      const match = indexes.find((index) => JSON.stringify(index.key) === JSON.stringify(keys));
      if (match) await collection.dropIndex(match.name).catch(() => null);
      return;
    }
    await collection.dropIndex(nameOrColumns).catch(() => null);
  }

  async bulkInsert(table, rows = []) {
    const collection = this.db.collection(table);
    const docs = [];
    for (const row of rows) {
      const doc = normalizeDocument(row);
      if (doc.id == null) doc.id = await MongoDB.default.nextId(table);
      if (!doc.createdAt) doc.createdAt = new Date();
      if (!doc.updatedAt) doc.updatedAt = new Date();
      docs.push(doc);
    }
    if (docs.length) await collection.insertMany(docs, { ordered: false }).catch(async (error) => {
      if (error && error.code !== 11000) throw error;
    });
  }

  async bulkDelete(table, where = null) {
    const { mongoWhere } = require('@core/util/classes/MongoModel');
    const collection = this.db.collection(table);
    const normalized = where
      ? Object.entries(where).reduce((carry, [key, value]) => {
          carry[snakeToCamel(key)] = value;
          return carry;
        }, {})
      : {};
    await collection.deleteMany(mongoWhere(normalized));
  }
}

async function filesIn(kind) {
  const dir = path.join(__dirname, kind);
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((file) => file.endsWith('.js')).sort()
    : [];
}

async function runModules(kind, direction) {
  loadModels();
  const db = await MongoDB.default.db();
  await MongoModel.syncAll();
  const tracker = db.collection(kind === 'migrations' ? '_migrations' : '_seeders');
  const qi = new MongoQueryInterface(db);
  const files = await filesIn(kind);
  const applied = await tracker.find({}).toArray();
  const appliedNames = new Set(applied.map((row) => row.name));

  const targets = direction === 'up'
    ? files.filter((file) => !appliedNames.has(file))
    : files.filter((file) => appliedNames.has(file)).reverse();

  for (const file of targets) {
    const mod = require(path.join(__dirname, kind, file));
    const fn = direction === 'up' ? mod.up : mod.down;
    if (typeof fn !== 'function') continue;
    await fn(qi, DataTypes);
    if (direction === 'up') await tracker.updateOne({ name: file }, { $set: { name: file, appliedAt: new Date() } }, { upsert: true });
    else await tracker.deleteOne({ name: file });
    console.log(`${direction === 'up' ? 'applied' : 'reverted'} ${kind}/${file}`);
  }
}

async function main() {
  const command = process.argv[2] || 'help';
  if (command === 'migrate') await runModules('migrations', 'up');
  else if (command === 'migrate:undo') await runModules('migrations', 'down');
  else if (command === 'seed') await runModules('seeders', 'up');
  else if (command === 'seed:undo') await runModules('seeders', 'down');
  else {
    console.log('Usage: mongo-cli.js migrate|migrate:undo|seed|seed:undo');
  }
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await MongoDB.default.close();
    });
}

module.exports = {
  MongoQueryInterface,
  runModules,
};
