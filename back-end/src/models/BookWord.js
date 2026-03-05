const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BookWord = sequelize.define(
  'BookWord',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '词书内排序',
    },
  },
  {
    tableName: 'book_words',
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['book_id', 'word_id'] },
      { fields: ['book_id', 'sort_order'] },
    ],
  }
);

module.exports = BookWord;
