const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserWordList = sequelize.define(
  'UserWordList',
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
    word_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'words', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'user_word_lists',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'word_id'] }],
  }
);

module.exports = UserWordList;
