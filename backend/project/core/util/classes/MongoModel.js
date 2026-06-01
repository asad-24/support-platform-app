'use strict';

const MongoDB = require('./MongoDB');

const REGISTRY = [];

function dataType(name) {
  const fn = () => ({ type: name });
  fn.UNSIGNED = fn;
  return fn;
}

const DataTypes = {
  STRING: dataType('string'),
  TEXT: dataType('text'),
  INTEGER: dataType('integer'),
  BIGINT: dataType('bigint'),
  SMALLINT: dataType('smallint'),
  TINYINT: dataType('tinyint'),
  DECIMAL: dataType('decimal'),
  BOOLEAN: { type: 'boolean' },
  DATE: { type: 'date' },
  DATEONLY: { type: 'dateonly' },
  JSON: { type: 'json' },
};

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function clone(value) {
  if (value === undefined) return undefined;
  if (value instanceof Date) return new Date(value);
  if (!isPlainObject(value) && !Array.isArray(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function normalizeId(value) {
  if (value === undefined || value === null || value === '') return value;
  const number = Number(value);
  return Number.isFinite(number) && String(value).match(/^\d+$/) ? number : value;
}

function operatorKey(key) {
  if (typeof key === 'symbol') {
    const text = String(key);
    if (text.includes('or')) return '$or';
    if (text.includes('ne')) return '$ne';
    if (text.includes('like')) return '$like';
    if (text.includes('in')) return '$in';
  }
  return key;
}

function likeRegex(pattern) {
  const escaped = String(pattern)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function mongoWhere(where = {}) {
  if (!where || !Object.keys(where).length) return {};
  const query = {};

  for (const rawKey of Reflect.ownKeys(where)) {
    const key = operatorKey(rawKey);
    const value = where[rawKey];
    if (key === '$or') {
      query.$or = (Array.isArray(value) ? value : []).map(mongoWhere);
      continue;
    }

    const field = key === 'id' ? 'id' : key;
    if (Array.isArray(value)) {
      query[field] = { $in: value.map(normalizeId) };
    } else if (isPlainObject(value)) {
      const condition = {};
      for (const opRaw of Reflect.ownKeys(value)) {
        const op = operatorKey(opRaw);
        const operand = value[opRaw];
        if (op === '$ne') condition.$ne = normalizeId(operand);
        else if (op === '$in') condition.$in = (Array.isArray(operand) ? operand : []).map(normalizeId);
        else if (op === '$notIn') condition.$nin = (Array.isArray(operand) ? operand : []).map(normalizeId);
        else if (op === '$like') condition.$regex = likeRegex(operand);
        else condition[op] = operand;
      }
      query[field] = condition;
    } else {
      query[field] = field === 'id' ? normalizeId(value) : value;
    }
  }

  return query;
}

function mongoSort(order) {
  if (!order) return {};
  const items = Array.isArray(order) ? order : [order];
  return items.reduce((sort, item) => {
    if (typeof item === 'string') sort[item] = 1;
    else if (Array.isArray(item) && item.length) sort[item[0]] = String(item[1] || 'ASC').toUpperCase() === 'DESC' ? -1 : 1;
    return sort;
  }, {});
}

class MongoModel {
  constructor(values = {}, options = {}) {
    Object.assign(this, values);
    Object.defineProperty(this, '_isNewRecord', {
      value: Boolean(options.isNewRecord),
      writable: true,
      enumerable: false,
    });
  }

  static init(attributes = {}, options = {}) {
    this.attributes = attributes;
    this.collectionName = options.tableName || options.collectionName || this.name;
    this.modelName = options.modelName || this.name;
    this.timestamps = options.timestamps !== false;
    if (!REGISTRY.includes(this)) REGISTRY.push(this);
    return this;
  }

  static async collection() {
    return MongoDB.default.collection(this.collectionName);
  }

  static defaults() {
    const payload = {};
    for (const [key, definition] of Object.entries(this.attributes || {})) {
      if (definition && Object.prototype.hasOwnProperty.call(definition, 'defaultValue')) {
        payload[key] = typeof definition.defaultValue === 'function' ? definition.defaultValue() : clone(definition.defaultValue);
      }
    }
    return payload;
  }

  static nullableUniqueKeys() {
    return Object.entries(this.attributes || {})
      .filter(([, definition]) => definition && definition.unique && definition.allowNull !== false)
      .map(([key]) => key);
  }

  static prepareCreate(doc) {
    for (const key of this.nullableUniqueKeys()) {
      if (doc[key] === null || doc[key] === undefined || doc[key] === '') delete doc[key];
    }
    return doc;
  }

  static prepareUpdate(values = {}) {
    const set = { ...values };
    const unset = {};
    for (const key of this.nullableUniqueKeys()) {
      if (set[key] === null || set[key] === undefined || set[key] === '') {
        delete set[key];
        unset[key] = '';
      }
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    return update;
  }

  static hydrate(doc) {
    return doc ? new this(doc, { isNewRecord: false }) : null;
  }

  static async sync() {
    await this.ensureIndexes();
    return this;
  }

  static async syncAll() {
    for (const Model of REGISTRY) await Model.sync();
  }

  static async ensureIndexes() {
    const collection = await this.collection();
    await collection.createIndex({ id: 1 }, { unique: true });
    for (const [key, definition] of Object.entries(this.attributes || {})) {
      if (definition && definition.unique) {
        await collection.createIndex(
          { [key]: 1 },
          { unique: true, sparse: definition.allowNull !== false }
        );
      }
    }
    for (const index of this.indexes || []) {
      await collection.createIndex(index.keys, index.options || {});
    }
  }

  static async create(values = {}, options = {}) {
    const now = new Date();
    const doc = { ...this.defaults(), ...values };
    if (doc.id === undefined || doc.id === null) doc.id = await MongoDB.default.nextId(this.collectionName);
    else doc.id = normalizeId(doc.id);
    if (this.timestamps) {
      if (!doc.createdAt) doc.createdAt = now;
      if (!doc.updatedAt) doc.updatedAt = now;
    }
    this.prepareCreate(doc);
    const collection = await this.collection();
    await collection.insertOne(doc, { session: options.transaction || undefined });
    return this.hydrate(doc);
  }

  static async bulkCreate(rows = [], options = {}) {
    const created = [];
    for (const row of rows) created.push(await this.create(row, options));
    return created;
  }

  static async findOne(options = {}) {
    const collection = await this.collection();
    const query = mongoWhere(options.where || {});
    let cursor = collection.find(query);
    const sort = mongoSort(options.order);
    if (Object.keys(sort).length) cursor = cursor.sort(sort);
    const doc = await cursor.limit(1).next();
    return this.hydrate(doc);
  }

  static async findByPk(id, options = {}) {
    return this.findOne({ ...options, where: { id: normalizeId(id), ...(options.where || {}) } });
  }

  static async findAll(options = {}) {
    const collection = await this.collection();
    const query = mongoWhere(options.where || {});
    let cursor = collection.find(query);
    const sort = mongoSort(options.order);
    if (Object.keys(sort).length) cursor = cursor.sort(sort);
    if (options.offset) cursor = cursor.skip(Number(options.offset));
    if (options.limit) cursor = cursor.limit(Number(options.limit));
    const rows = await cursor.toArray();
    return rows.map((row) => this.hydrate(row));
  }

  static async findAndCountAll(options = {}) {
    const collection = await this.collection();
    const query = mongoWhere(options.where || {});
    const [rows, count] = await Promise.all([
      this.findAll(options),
      collection.countDocuments(query),
    ]);
    return { rows, count };
  }

  static async count(options = {}) {
    const collection = await this.collection();
    return collection.countDocuments(mongoWhere(options.where || {}));
  }

  static async update(values = {}, options = {}) {
    const collection = await this.collection();
    const update = { ...values };
    if (this.timestamps) update.updatedAt = new Date();
    const mongoUpdate = this.prepareUpdate(update);
    if (!Object.keys(mongoUpdate).length) return [0];
    const result = await collection.updateMany(
      mongoWhere(options.where || {}),
      mongoUpdate,
      { session: options.transaction || undefined }
    );
    return [result.modifiedCount];
  }

  static async destroy(options = {}) {
    const collection = await this.collection();
    const result = await collection.deleteMany(mongoWhere(options.where || {}), {
      session: options.transaction || undefined,
    });
    return result.deletedCount;
  }

  static async drop() {
    const collection = await this.collection();
    return collection.drop().catch(() => null);
  }

  async save(options = {}) {
    const Model = this.constructor;
    const collection = await Model.collection();
    if (Model.timestamps) this.updatedAt = new Date();
    const data = this.toJSON();
    const mongoUpdate = Model.prepareUpdate(data);
    await collection.updateOne(
      { id: this.id },
      Object.keys(mongoUpdate).length ? mongoUpdate : { $set: { id: this.id } },
      { upsert: true, session: options.transaction || undefined }
    );
    this._isNewRecord = false;
    return this;
  }

  async update(values = {}, options = {}) {
    Object.assign(this, values);
    return this.save(options);
  }

  async destroy(options = {}) {
    const collection = await this.constructor.collection();
    await collection.deleteOne({ id: this.id }, { session: options.transaction || undefined });
    return 1;
  }

  async reload() {
    const fresh = await this.constructor.findByPk(this.id);
    if (fresh) Object.assign(this, fresh.toJSON());
    return this;
  }

  toJSON() {
    const data = {};
    for (const [key, value] of Object.entries(this)) {
      if (!key.startsWith('_') && key !== '_id') data[key] = clone(value);
    }
    return data;
  }
}

MongoModel.registry = REGISTRY;
MongoModel.mongoWhere = mongoWhere;
MongoModel.mongoSort = mongoSort;

module.exports = {
  MongoModel,
  DataTypes,
  mongoWhere,
  mongoSort,
};
