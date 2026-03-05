const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Word = sequelize.define(
  'Word',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    word: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: '单词',
    },
    phonetic: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: '音标',
    },
    definitions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '释义数组，如 [{ pos: "n.", meaning: "意义" }]',
    },
    pronunciation_url: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: '发音 URL 或 TTS 标识',
    },
  },
  {
    tableName: 'words',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['word'] }],
  }
);

module.exports = Word;
