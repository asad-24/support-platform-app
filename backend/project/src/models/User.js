'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class User extends Model {
  static init() {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        username: { type: DataTypes.STRING, allowNull: true, unique: true },
        role: { type: DataTypes.STRING, allowNull: false },
        passwordSalt: { type: DataTypes.STRING, allowNull: false, field: 'password_salt' },
        passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
        accessToken: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'access_token' },
        accessTokenCreatedAt: { type: DataTypes.DATE, allowNull: true, field: 'access_token_created_at' },
        refreshToken: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'refresh_token' },
        refreshTokenCreatedAt: { type: DataTypes.DATE, allowNull: true, field: 'refresh_token_created_at' },
      },
      { sequelize, tableName: 'users', modelName: 'User' }
    );
  }
}

User.init();
debug('model: defined User');

module.exports = User;
