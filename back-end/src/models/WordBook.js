const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WordBook = sequelize.define(
  'WordBook',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      comment: '词书名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述',
    },
    word_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '单词数量',
    },
    exam_tag: {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: '考种标签：考研/四六级等',
    },
  },
  {
    tableName: 'word_books',
    timestamps: true,
    underscored: true,
  }
);

module.exports = WordBook;
