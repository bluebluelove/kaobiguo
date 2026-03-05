const { Op } = require('sequelize');
const {
  User,
  UserLearning,
  UserCurrentBook,
  WordBook,
  BookWord,
  Word,
} = require('../models');
const config = require('../config/config');

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const todayStr = () => {
  return new Date().toISOString().slice(0, 10);
};

/** 今日已学新词数量（按 first_learned_at 在今天） */
const getTodayLearnedCount = async (userId, bookId) => {
  const start = today();
  const count = await UserLearning.count({
    where: {
      user_id: userId,
      book_id: bookId,
      first_learned_at: { [Op.gte]: start },
    },
  });
  return count;
};

/** 获取用户每日新词上限（优先用户设置） */
const getWordsPerDay = (user) => {
  const n = user?.daily_new_words_limit;
  return n != null && n > 0 ? n : config.dailyNewWordsLimit;
};

/** 从数据库读取用户每课词数（避免 req.user 缺列或未刷新导致始终用默认值） */
const getWordsPerLessonFromDb = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['daily_new_words_limit'] });
  return getWordsPerDay(user);
};

/** 今日可学新词数量 = min(每日上限, 词书中未学数量) */
const getTodayNewCount = async (userId, user) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) return { count: 0 };

  const bookId = current.book_id;
  const limit = getWordsPerDay(user) ?? config.dailyNewWordsLimit;
  const todayLearned = await getTodayLearnedCount(userId, bookId);
  const remaining = Math.max(0, limit - todayLearned);

  const learnedWordIds = await UserLearning.findAll({
    where: { user_id: userId, book_id: bookId },
    attributes: ['word_id'],
  });
  const learnedSet = new Set(learnedWordIds.map((r) => r.word_id));

  const totalInBook = await BookWord.count({ where: { book_id: bookId } });
  const notLearnedTotal = totalInBook - learnedSet.size;
  const count = Math.min(remaining, notLearnedTotal);
  return { count };
};

/** 下一个待学单词：词书中按 sort_order 的第一个未学词 */
const getNextWord = async (userId) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) return null;

  const bookId = current.book_id;
  const learnedWordIds = await UserLearning.findAll({
    where: { user_id: userId, book_id: bookId },
    attributes: ['word_id'],
  });
  const learnedSet = new Set(learnedWordIds.map((r) => r.word_id));

  const candidates = await BookWord.findAll({
    where: { book_id: bookId },
    order: [['sort_order', 'ASC']],
    include: [{ model: Word, as: 'Word', required: true }],
  });

  for (const bw of candidates) {
    if (!learnedSet.has(bw.word_id)) {
      const w = bw.Word;
      return {
        id: w.id,
        word: w.word,
        phonetic: w.phonetic,
        definitions: w.definitions,
        pronunciation_url: w.pronunciation_url,
      };
    }
  }
  return null;
};

/** 获取当前词书的课程列表（按每课词数划分），并标记每课是否已完成；若传入 bookId 则优先使用，保证与前端当前词书一致 */
const getLessons = async (userId, user, explicitBookId) => {
  let bookId = explicitBookId;
  if (bookId == null || Number.isNaN(bookId)) {
    const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
    if (!current) return { list: [], wordsPerLesson: 20, totalWords: 0 };
    bookId = current.book_id;
  }
  const book = await WordBook.findByPk(bookId);
  if (!book) return { list: [], wordsPerLesson: 20, totalWords: 0 };
  const wordsPerLesson = await getWordsPerLessonFromDb(userId);

  const learnedRows = await UserLearning.findAll({
    where: { user_id: userId, book_id: bookId },
    attributes: ['word_id'],
  });
  const learnedSet = new Set(learnedRows.map((r) => r.word_id));

  const allBookWords = await BookWord.findAll({
    where: { book_id: bookId },
    order: [['sort_order', 'ASC']],
    attributes: ['word_id'],
  });
  const totalWords = allBookWords.length;
  const totalLessons = Math.ceil(totalWords / wordsPerLesson) || 0;
  const list = [];
  for (let i = 1; i <= totalLessons; i++) {
    const start = (i - 1) * wordsPerLesson;
    const lessonWordIds = allBookWords.slice(start, start + wordsPerLesson).map((r) => r.word_id);
    const count = lessonWordIds.length;
    const completed = count > 0 && lessonWordIds.every((id) => learnedSet.has(id));
    list.push({ lessonIndex: i, wordCount: count, completed });
  }
  return { list, wordsPerLesson, totalWords };
};

/** 获取某一课的所有单词；若传入 bookId 则优先使用，保证与课程列表一致 */
const getLessonWords = async (userId, lessonIndex, user, explicitBookId) => {
  let bookId = explicitBookId;
  if (bookId == null || Number.isNaN(bookId)) {
    const current = await UserCurrentBook.findOne({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
    });
    if (!current) return null;
    bookId = current.book_id;
  }
  const book = await WordBook.findByPk(bookId);
  if (!book) return null;

  const wordsPerLesson = await getWordsPerLessonFromDb(userId);
  const lessonNum = parseInt(lessonIndex, 10);
  if (Number.isNaN(lessonNum) || lessonNum < 1) return null;
  const offset = (lessonNum - 1) * wordsPerLesson;
  if (offset < 0) return null;

  const learnedRows = await UserLearning.findAll({
    where: { user_id: userId, book_id: bookId },
    attributes: ['word_id'],
  });
  const learnedSet = new Set(learnedRows.map((r) => r.word_id));

  const rows = await BookWord.findAll({
    where: { book_id: bookId },
    order: [['sort_order', 'ASC']],
    include: [{ model: Word, as: 'Word', required: true }],
    limit: wordsPerLesson,
    offset,
  });

  const list = rows.map((bw) => {
    const w = bw.Word;
    return {
      id: w.id,
      word: w.word,
      phonetic: w.phonetic,
      definitions: w.definitions,
      pronunciation_url: w.pronunciation_url,
      learned: learnedSet.has(w.id),
    };
  });
  const unlearnedCount = list.filter((item) => !item.learned).length;
  return { list, lessonIndex: lessonNum, totalInLesson: list.length, unlearnedCount };
};

/** 设置每天背几个单词（每课词数） */
const setWordsPerDay = async (userId, wordsPerDay) => {
  const n = parseInt(wordsPerDay, 10);
  if (Number.isNaN(n) || n < 5 || n > 100) {
    const err = new Error('每日词数须在 5～100 之间');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findByPk(userId);
  if (!user) return null;
  await user.update({ daily_new_words_limit: n });
  return { wordsPerDay: n };
};

/** 标记单词已学，并设置下次复习日（简单规则：+1 天） */
const markLearned = async (userId, wordId) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) {
    const err = new Error('请先选择词书');
    err.statusCode = 400;
    throw err;
  }

  const bookId = current.book_id;
  const wordIdNum = typeof wordId === 'string' ? parseInt(wordId, 10) : wordId;

  const exists = await BookWord.findOne({
    where: { book_id: bookId, word_id: wordIdNum },
  });
  if (!exists) {
    const err = new Error('该词不在当前词书中');
    err.statusCode = 400;
    throw err;
  }

  const [record, created] = await UserLearning.findOrCreate({
    where: { user_id: userId, book_id: bookId, word_id: wordIdNum },
    defaults: {
      first_learned_at: new Date(),
      next_review_at: getNextReviewDate(0),
    },
  });

  if (!created) {
    await record.update({
      next_review_at: getNextReviewDate(record.review_count || 0),
    });
  }

  return { ok: true };
};

/** 简单复习间隔：第 1/2/7 天 */
function getNextReviewDate(reviewCount) {
  const d = new Date();
  if (reviewCount === 0) d.setDate(d.getDate() + 1);
  else if (reviewCount === 1) d.setDate(d.getDate() + 2);
  else d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  getTodayNewCount,
  getNextWord,
  markLearned,
  getLessons,
  getLessonWords,
  setWordsPerDay,
  getWordsPerDay,
  getTodayLearnedCount,
  todayStr,
  getNextReviewDate,
};
