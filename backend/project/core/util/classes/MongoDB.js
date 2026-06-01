'use strict';

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('@core/util/functions/config');

function loadModels() {
  const candidates = [
    path.join(process.cwd(), 'src', 'models'),
    path.resolve(__dirname, '..', '..', '..', 'src', 'models'),
  ];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.js')) require(path.join(dir, file));
    }
    return;
  }
}

class MongoDB {
  constructor() {
    this.client = null;
    this.database = null;
  }

  static get default() {
    if (!this._default) this._default = new MongoDB();
    return this._default;
  }

  uri() {
    const dbCfg = config('db') || {};
    return dbCfg.uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  }

  dbName() {
    const dbCfg = config('db') || {};
    if (process.env.NODE_ENV === 'test') {
      return process.env.MONGODB_TEST_DB_NAME || dbCfg.testDatabase || 'support_platform_app_test';
    }
    return process.env.MONGODB_DB_NAME || dbCfg.database || 'support_platform_app';
  }

  async connect() {
    if (this.database) return this.database;
    this.client = new MongoClient(this.uri(), { ignoreUndefined: true });
    await this.client.connect();
    this.database = this.client.db(this.dbName());
    return this.database;
  }

  async db() {
    return this.connect();
  }

  async collection(name) {
    const db = await this.db();
    return db.collection(name);
  }

  async authenticate() {
    const db = await this.db();
    await db.command({ ping: 1 });
    return true;
  }

  async close() {
    if (this.client) await this.client.close();
    this.client = null;
    this.database = null;
  }

  async sync(options = {}) {
    const { MongoModel } = require('./MongoModel');
    loadModels();
    const db = await this.db();
    if (options.force) {
      await db.dropDatabase();
    }
    await MongoModel.syncAll();
  }

  async transaction(callback) {
    return callback(null);
  }

  async nextId(name) {
    const counters = await this.collection('counters');
    const result = await counters.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const doc = result && result.value ? result.value : result;
    return doc.seq;
  }
}

module.exports = MongoDB;
