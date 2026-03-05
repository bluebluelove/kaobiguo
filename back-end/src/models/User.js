const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    account: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      comment: '账号：邮箱或手机号',
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码哈希',
    },
    nickname: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: '',
      comment: '昵称',
    },
    avatar: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: '头像 URL',
    },
    daily_new_words_limit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 20,
      comment: '每天背几个单词（每课词数）',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
