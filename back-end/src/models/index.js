const { sequelize } = require('../config/db');
const User = require('./User');
const WordBook = require('./WordBook');
const Word = require('./Word');
const BookWord = require('./BookWord');
const UserLearning = require('./UserLearning');
const UserWordList = require('./UserWordList');
const UserCurrentBook = require('./UserCurrentBook');

// Associations
User.belongsToMany(WordBook, { through: UserCurrentBook, foreignKey: 'user_id' });
WordBook.belongsToMany(User, { through: UserCurrentBook, foreignKey: 'book_id' });

UserCurrentBook.belongsTo(User, { foreignKey: 'user_id' });
UserCurrentBook.belongsTo(WordBook, { foreignKey: 'book_id' });
User.hasOne(UserCurrentBook, { foreignKey: 'user_id' });
WordBook.hasMany(UserCurrentBook, { foreignKey: 'book_id' });

WordBook.belongsToMany(Word, { through: BookWord, foreignKey: 'book_id' });
Word.belongsToMany(WordBook, { through: BookWord, foreignKey: 'word_id' });
BookWord.belongsTo(WordBook, { foreignKey: 'book_id' });
BookWord.belongsTo(Word, { foreignKey: 'word_id' });
WordBook.hasMany(BookWord, { foreignKey: 'book_id' });
Word.hasMany(BookWord, { foreignKey: 'word_id' });

UserLearning.belongsTo(User, { foreignKey: 'user_id' });
UserLearning.belongsTo(WordBook, { foreignKey: 'book_id' });
UserLearning.belongsTo(Word, { foreignKey: 'word_id' });
User.hasMany(UserLearning, { foreignKey: 'user_id' });
WordBook.hasMany(UserLearning, { foreignKey: 'book_id' });
Word.hasMany(UserLearning, { foreignKey: 'word_id' });

UserWordList.belongsTo(User, { foreignKey: 'user_id' });
UserWordList.belongsTo(Word, { foreignKey: 'word_id' });
User.hasMany(UserWordList, { foreignKey: 'user_id' });
Word.hasMany(UserWordList, { foreignKey: 'word_id' });

module.exports = {
  sequelize,
  User,
  WordBook,
  Word,
  BookWord,
  UserLearning,
  UserWordList,
  UserCurrentBook,
};
