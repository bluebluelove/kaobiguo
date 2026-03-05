const {
  UserLearning,
  UserCurrentBook,
  Word,
} = require('../models');

const todayStr = () => new Date().toISOString().slice(0, 10);

/** 今日待复习列表：next_review_at = 今天 */
const getTodayReviewList = async (userId) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) return { list: [] };

  const today = todayStr();
  const records = await UserLearning.findAll({
    where: {
      user_id: userId,
      book_id: current.book_id,
      next_review_at: today,
    },
    include: [{ model: Word, as: 'Word', attributes: ['id', 'word', 'phonetic', 'definitions'] }],
    order: [['next_review_at', 'ASC'], ['id', 'ASC']],
  });

  const list = records
    .filter((r) => r.Word)
    .map((r) => ({
      id: r.Word.id,
      word: r.Word.word,
      phonetic: r.Word.phonetic,
      definitions: r.Word.definitions,
    }));

  return { list };
};

/** 简单规则：认识 +1 天后再复习，不认识 +1 天 */
const getNextReviewDate = (reviewCount, known) => {
  const d = new Date();
  if (known) {
    if (reviewCount === 0) d.setDate(d.getDate() + 1);
    else if (reviewCount === 1) d.setDate(d.getDate() + 2);
    else d.setDate(d.getDate() + 7);
  } else {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
};

/** 提交复习结果 */
const submitResult = async (userId, wordId, known) => {
  const current = await UserCurrentBook.findOne({ where: { user_id: userId } });
  if (!current) {
    const err = new Error('请先选择词书');
    err.statusCode = 400;
    throw err;
  }

  const wordIdNum = typeof wordId === 'string' ? parseInt(wordId, 10) : wordId;
  const record = await UserLearning.findOne({
    where: {
      user_id: userId,
      book_id: current.book_id,
      word_id: wordIdNum,
    },
  });

  if (!record) {
    const err = new Error('未找到该学习记录');
    err.statusCode = 404;
    throw err;
  }

  const nextReview = getNextReviewDate(record.review_count || 0, known);
  await record.update({
    review_count: (record.review_count || 0) + 1,
    last_review_at: new Date(),
    next_review_at: nextReview,
  });

  return { ok: true };
};

module.exports = { getTodayReviewList, submitResult };
