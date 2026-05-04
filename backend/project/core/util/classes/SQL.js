'use strict';

const { mongoWhere, mongoSort } = require('./MongoModel');
const MongoDB = require('./MongoDB');

class SQL {
  constructor(options = {}) {
    this.mongo = options.mongo || MongoDB.default;
  }

  static get default() {
    if (!this._default) this._default = new SQL();
    return this._default;
  }

  static select(...args) { return this.default.select(...args); }
  static first(...args) { return this.default.first(...args); }
  static find(...args) { return this.default.find(...args); }
  static insert(...args) { return this.default.insert(...args); }
  static update(...args) { return this.default.update(...args); }
  static delete(...args) { return this.default.delete(...args); }
  static count(...args) { return this.default.count(...args); }

  async collection(table) {
    return this.mongo.collection(table);
  }

  async select(table, options = {}) {
    const collection = await this.collection(table);
    let cursor = collection.find(mongoWhere(options.where || {}));
    const sort = mongoSort(options.order);
    if (Object.keys(sort).length) cursor = cursor.sort(sort);
    if (options.offset) cursor = cursor.skip(Number(options.offset));
    if (options.limit) cursor = cursor.limit(Number(options.limit));
    return cursor.toArray();
  }

  async first(table, options = {}) {
    const rows = await this.select(table, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async find(table, id, options = {}) {
    const pk = options.pk || 'id';
    return this.first(table, { ...options, where: { ...(options.where || {}), [pk]: id } });
  }

  async insert(table, data) {
    const collection = await this.collection(table);
    const doc = { ...data };
    if (doc.id == null) doc.id = await this.mongo.nextId(table);
    await collection.insertOne(doc);
    return doc;
  }

  async update(table, data, options = {}) {
    if (!options.where && options.requireWhere !== false) {
      throw new Error('SQL.update requires a where clause unless requireWhere is false');
    }
    const collection = await this.collection(table);
    return collection.updateMany(mongoWhere(options.where || {}), { $set: data });
  }

  async delete(table, options = {}) {
    if (!options.where && options.requireWhere !== false) {
      throw new Error('SQL.delete requires a where clause unless requireWhere is false');
    }
    const collection = await this.collection(table);
    return collection.deleteMany(mongoWhere(options.where || {}));
  }

  async count(table, options = {}) {
    const collection = await this.collection(table);
    return collection.countDocuments(mongoWhere(options.where || {}));
  }
}

module.exports = SQL;
