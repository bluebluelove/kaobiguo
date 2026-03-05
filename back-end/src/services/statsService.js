const { Op } = require('sequelize');
const {
  UserLearning,
  UserCurrentBook,
  BookWord,
} = require('../models');

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** 今日已学新词数量、今日已复习数量 */
const getTodayStats = async (userId) => {
  const start = todayStart();
  const learned = await UserLearning.count({
    where: {
      user_id: userId,
      first_learned_at: { [Op.gte]: start },
    },
  });

  const reviewed = await UserLearning.count({
    where: {
      user_id: userId,
      last_review_at: { [Op.gte]: start },
    },
  });

  return { learned, reviewed };
};

/** 当前词书进度：已学数 / 总词数 */
const getBookProgress = async (userId) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) {
    return { learned: 0, total: 0 };
  }

  const learned = await UserLearning.count({
    where: { user_id: userId, book_id: current.book_id },
  });
  const total = await BookWord.count({
    where: { book_id: current.book_id },
  });

  return { learned, total };
};

module.exports = { getTodayStats, getBookProgress };
