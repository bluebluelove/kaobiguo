const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserCurrentBook = sequelize.define(
  'UserCurrentBook',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    book_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'word_books', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'user_current_books',
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserCurrentBook;
