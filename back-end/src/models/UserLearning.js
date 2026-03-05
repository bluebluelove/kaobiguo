const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserLearning = sequelize.define(
  'UserLearning',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    book_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'word_books', key: 'id' },
      onDelete: 'CASCADE',
    },
    word_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'words', key: 'id' },
      onDelete: 'CASCADE',
    },
    first_learned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '首次学习时间',
    },
    next_review_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '下次复习日期（简单规则：学完后 1/2/7 天）',
    },
    review_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '复习次数',
    },
    last_review_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上次复习时间',
    },
  },
  {
    tableName: 'user_learnings',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'book_id', 'word_id'] },
      { fields: ['user_id', 'next_review_at'] },
    ],
  }
);

module.exports = UserLearning;
