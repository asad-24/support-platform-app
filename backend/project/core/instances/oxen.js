'use strict';

const MongoDB = require('@core/util/classes/MongoDB');

const _cache = new Map();

class MongoQueue {
  constructor(jobType) {
    this.jobType = jobType;
    this.timer = null;
    this.processing = false;
    this.workFn = null;
  }

  async collection() {
    return MongoDB.default.collection('oxen_queue');
  }

  async createTable() {
    const collection = await this.collection();
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ jobType: 1, status: 1, priority: -1, createdAt: 1 });
  }

  async deleteTable() {
    const collection = await this.collection();
    await collection.deleteMany({ jobType: this.jobType });
  }

  async addJob(payload = {}, options = {}) {
    await this.createTable();
    const collection = await this.collection();
    const doc = {
      id: await MongoDB.default.nextId('oxen_queue'),
      jobType: this.jobType,
      payload,
      body: JSON.stringify(payload),
      status: 'waiting',
      priority: Number(options.priority || 0),
      createdAt: new Date(),
      startedAt: null,
      result: null,
      error: null,
    };
    await collection.insertOne(doc);
    this.kick();
    return doc;
  }

  process(arg, maybeWorkFn = null) {
    if (typeof arg === 'function') {
      this.workFn = async (payload) => arg({ payload });
    } else if (arg && typeof arg.work_fn === 'function') {
      this.workFn = arg.work_fn;
    } else if (typeof maybeWorkFn === 'function') {
      this.workFn = async (payload) => maybeWorkFn({ payload });
    } else {
      throw new Error('MongoQueue.process requires a work function');
    }

    this.stopProcessing();
    this.timer = setInterval(() => this.tick().catch(() => null), 100);
    this.kick();
  }

  kick() {
    setTimeout(() => this.tick().catch(() => null), 0);
  }

  async tick() {
    if (this.processing || !this.workFn) return;
    this.processing = true;
    try {
      await this.createTable();
      const collection = await this.collection();
      const job = await collection.findOneAndUpdate(
        { jobType: this.jobType, status: 'waiting' },
        { $set: { status: 'running', startedAt: new Date() } },
        { sort: { priority: -1, createdAt: 1 }, returnDocument: 'after' }
      );
      const doc = job && job.value ? job.value : job;
      if (!doc) return;

      try {
        const result = await this.workFn(doc.payload || JSON.parse(doc.body || '{}'));
        await collection.updateOne(
          { id: doc.id },
          { $set: { status: 'complete', result: result == null ? null : JSON.stringify(result), completedAt: new Date() } }
        );
      } catch (error) {
        await collection.updateOne(
          { id: doc.id },
          { $set: { status: 'failed', error: error.message || String(error), completedAt: new Date() } }
        );
      }
    } finally {
      this.processing = false;
    }
  }

  stopProcessing() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async selectEntireTable() {
    const collection = await this.collection();
    return collection.find({ jobType: this.jobType }).sort({ id: 1 }).toArray();
  }
}

function getInstance(jobType = 'email_jobs') {
  if (!_cache.has(jobType)) _cache.set(jobType, new MongoQueue(jobType));
  return _cache.get(jobType);
}

const defaultInstance = getInstance('email_jobs');
defaultInstance.for = (type) => getInstance(type);
defaultInstance.closeAll = async () => {
  for (const inst of _cache.values()) inst.stopProcessing();
  _cache.clear();
  await MongoDB.default.close();
};

module.exports = defaultInstance;
