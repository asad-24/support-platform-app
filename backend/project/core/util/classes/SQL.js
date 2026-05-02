'use strict';

const coreModel = require('./Model');

const OPERATORS = {
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
  $like: 'LIKE',
  $notLike: 'NOT LIKE',
};

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

class SQL {
  constructor(options = {}) {
    this.sequelize = options.sequelize || coreModel.sequelize;
    this.QueryTypes = (this.sequelize.Sequelize && this.sequelize.Sequelize.QueryTypes)
      || coreModel.Sequelize.QueryTypes;
    this.queryGenerator = this.sequelize.getQueryInterface().queryGenerator;
  }

  static get default() {
    if (!this._default) this._default = new SQL();
    return this._default;
  }

  static query(...args) { return this.default.query(...args); }
  static select(...args) { return this.default.select(...args); }
  static first(...args) { return this.default.first(...args); }
  static find(...args) { return this.default.find(...args); }
  static insert(...args) { return this.default.insert(...args); }
  static update(...args) { return this.default.update(...args); }
  static delete(...args) { return this.default.delete(...args); }
  static count(...args) { return this.default.count(...args); }

  async query(sql, options = {}) {
    return this.sequelize.query(sql, {
      replacements: options.replacements || {},
      type: options.type,
      transaction: options.transaction,
      plain: options.plain,
      raw: options.raw,
    });
  }

  async select(table, options = {}) {
    const replacements = {};
    const columns = this.buildColumns(options.columns);
    const sql = [
      `SELECT ${columns} FROM ${this.quoteTable(table)}`,
      this.buildWhere(options.where, replacements),
      this.buildOrder(options.order),
      this.buildLimitOffset(options, replacements),
    ].filter(Boolean).join(' ');

    return this.query(sql, {
      replacements,
      type: this.QueryTypes.SELECT,
      transaction: options.transaction,
    });
  }

  async first(table, options = {}) {
    const rows = await this.select(table, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async find(table, id, options = {}) {
    const pk = options.pk || 'id';
    return this.first(table, {
      ...options,
      where: { ...(options.where || {}), [pk]: id },
    });
  }

  async insert(table, data, options = {}) {
    const payload = this.cleanData(data);
    const replacements = {};
    const columns = Object.keys(payload);

    if (columns.length === 0) {
      throw new Error('SQL.insert requires at least one column');
    }

    const quotedColumns = columns.map((column) => this.quoteIdentifier(column)).join(', ');
    const values = columns.map((column) => this.bindValue(replacements, payload[column])).join(', ');
    const returning = this.buildReturning(options.returning);
    const sql = `INSERT INTO ${this.quoteTable(table)} (${quotedColumns}) VALUES (${values})${returning}`;

    return this.query(sql, {
      replacements,
      type: this.QueryTypes.INSERT,
      transaction: options.transaction,
    });
  }

  async update(table, data, options = {}) {
    const payload = this.cleanData(data);
    const replacements = {};
    const columns = Object.keys(payload);

    if (columns.length === 0) {
      throw new Error('SQL.update requires at least one column');
    }

    const where = this.buildWhere(options.where, replacements);
    if (!where && options.requireWhere !== false) {
      throw new Error('SQL.update requires a where clause unless requireWhere is false');
    }

    const setClause = columns
      .map((column) => `${this.quoteIdentifier(column)} = ${this.bindValue(replacements, payload[column])}`)
      .join(', ');
    const returning = this.buildReturning(options.returning);
    const sql = `UPDATE ${this.quoteTable(table)} SET ${setClause}${where ? ` ${where}` : ''}${returning}`;

    return this.query(sql, {
      replacements,
      type: this.QueryTypes.UPDATE,
      transaction: options.transaction,
    });
  }

  async delete(table, options = {}) {
    const replacements = {};
    const where = this.buildWhere(options.where, replacements);

    if (!where && options.requireWhere !== false) {
      throw new Error('SQL.delete requires a where clause unless requireWhere is false');
    }

    const sql = `DELETE FROM ${this.quoteTable(table)}${where ? ` ${where}` : ''}`;
    return this.query(sql, {
      replacements,
      type: this.QueryTypes.DELETE,
      transaction: options.transaction,
    });
  }

  async count(table, options = {}) {
    const replacements = {};
    const sql = [
      `SELECT COUNT(*) AS ${this.quoteIdentifier('count')} FROM ${this.quoteTable(table)}`,
      this.buildWhere(options.where, replacements),
    ].filter(Boolean).join(' ');

    const row = await this.query(sql, {
      replacements,
      type: this.QueryTypes.SELECT,
      plain: true,
      transaction: options.transaction,
    });
    return Number(row && row.count ? row.count : 0);
  }

  cleanData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('SQL data must be a plain object');
    }

    return Object.entries(data).reduce((carry, [key, value]) => {
      if (value !== undefined) carry[key] = value;
      return carry;
    }, {});
  }

  buildColumns(columns) {
    if (!columns || columns === '*') return '*';
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('SQL columns must be an array or "*"');
    }
    return columns.map((column) => this.quoteIdentifier(column)).join(', ');
  }

  buildWhere(where, replacements) {
    if (!where || Object.keys(where).length === 0) return '';
    const clauses = [];

    for (const [column, value] of Object.entries(where)) {
      clauses.push(this.buildWhereClause(column, value, replacements));
    }

    return `WHERE ${clauses.join(' AND ')}`;
  }

  buildWhereClause(column, value, replacements) {
    const quotedColumn = this.quoteIdentifier(column);

    if (value === null) return `${quotedColumn} IS NULL`;
    if (Array.isArray(value)) return this.buildInClause(quotedColumn, value, replacements, false);

    if (value && typeof value === 'object' && !(value instanceof Date)) {
      const parts = [];

      for (const [operator, operand] of Object.entries(value)) {
        if (operator === '$in') {
          parts.push(this.buildInClause(quotedColumn, operand, replacements, false));
        } else if (operator === '$notIn') {
          parts.push(this.buildInClause(quotedColumn, operand, replacements, true));
        } else if (operator === '$between') {
          if (!Array.isArray(operand) || operand.length !== 2) {
            throw new Error(`SQL where ${column}.$between requires exactly two values`);
          }
          parts.push(`${quotedColumn} BETWEEN ${this.bindValue(replacements, operand[0])} AND ${this.bindValue(replacements, operand[1])}`);
        } else if (operator === '$is') {
          if (operand !== null) throw new Error(`SQL where ${column}.$is only supports null`);
          parts.push(`${quotedColumn} IS NULL`);
        } else if (operator === '$not') {
          if (operand === null) {
            parts.push(`${quotedColumn} IS NOT NULL`);
          } else {
            parts.push(`${quotedColumn} != ${this.bindValue(replacements, operand)}`);
          }
        } else if (hasOwn(OPERATORS, operator)) {
          parts.push(`${quotedColumn} ${OPERATORS[operator]} ${this.bindValue(replacements, operand)}`);
        } else {
          throw new Error(`Unsupported SQL where operator: ${operator}`);
        }
      }

      return parts.length > 1 ? `(${parts.join(' AND ')})` : parts[0];
    }

    return `${quotedColumn} = ${this.bindValue(replacements, value)}`;
  }

  buildInClause(quotedColumn, value, replacements, negated) {
    if (!Array.isArray(value)) throw new Error('SQL IN value must be an array');
    if (value.length === 0) return negated ? '1 = 1' : '1 = 0';
    const placeholders = value.map((item) => this.bindValue(replacements, item)).join(', ');
    return `${quotedColumn} ${negated ? 'NOT IN' : 'IN'} (${placeholders})`;
  }

  buildOrder(order) {
    if (!order) return '';
    const items = Array.isArray(order) ? order : [order];
    if (items.length === 0) return '';

    const parts = items.map((item) => {
      if (typeof item === 'string') return `${this.quoteIdentifier(item)} ASC`;
      if (!Array.isArray(item) || item.length === 0) {
        throw new Error('SQL order items must be strings or [column, direction] arrays');
      }

      const direction = String(item[1] || 'ASC').toUpperCase();
      if (!['ASC', 'DESC'].includes(direction)) {
        throw new Error(`Unsupported SQL order direction: ${direction}`);
      }

      return `${this.quoteIdentifier(item[0])} ${direction}`;
    });

    return `ORDER BY ${parts.join(', ')}`;
  }

  buildLimitOffset(options, replacements) {
    const parts = [];
    if (options.limit != null) {
      parts.push(`LIMIT ${this.bindNumber(replacements, options.limit, 'limit')}`);
    }
    if (options.offset != null) {
      parts.push(`OFFSET ${this.bindNumber(replacements, options.offset, 'offset')}`);
    }
    return parts.join(' ');
  }

  buildReturning(returning) {
    if (!returning) return '';

    const dialect = this.sequelize.getDialect();
    if (!['postgres', 'sqlite'].includes(dialect)) return '';
    if (returning === true) return ' RETURNING *';
    return ` RETURNING ${this.buildColumns(returning)}`;
  }

  bindNumber(replacements, value, name) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) {
      throw new Error(`SQL ${name} must be a non-negative integer`);
    }
    return this.bindValue(replacements, number);
  }

  bindValue(replacements, value) {
    const key = `p${Object.keys(replacements).length}`;
    replacements[key] = value;
    return `:${key}`;
  }

  quoteTable(table) {
    return this.quoteIdentifier(table);
  }

  quoteIdentifier(identifier) {
    if (typeof identifier !== 'string' || !identifier.trim()) {
      throw new Error('SQL identifier must be a non-empty string');
    }

    return identifier
      .split('.')
      .map((part) => {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(part)) {
          throw new Error(`Unsafe SQL identifier: ${identifier}`);
        }
        return this.queryGenerator.quoteIdentifier(part);
      })
      .join('.');
  }
}

module.exports = SQL;
