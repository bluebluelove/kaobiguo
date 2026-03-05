const asyncHandler = require('express-async-handler');
const learnService = require('../services/learnService');

exports.todayNew = asyncHandler(async (req, res) => {
  const count = await learnService.getTodayNewCount(req.user.id, req.user);
  res.json(count);
});

exports.settings = asyncHandler(async (req, res) => {
  const wordsPerDay = req.user.daily_new_words_limit ?? require('../config/config').dailyNewWordsLimit;
  res.json({ wordsPerDay });
});

exports.setSettings = asyncHandler(async (req, res) => {
  const { wordsPerDay } = req.body;
  const result = await learnService.setWordsPerDay(req.user.id, wordsPerDay);
  res.json(result);
});

exports.lessons = asyncHandler(async (req, res) => {
  const bookId = req.query.bookId != null ? parseInt(req.query.bookId, 10) : undefined;
  const result = await learnService.getLessons(req.user.id, req.user, bookId);
  res.json(result);
});

exports.lessonWords = asyncHandler(async (req, res) => {
  const { lessonIndex } = req.params;
  const bookId = req.query.bookId != null ? parseInt(req.query.bookId, 10) : undefined;
  const result = await learnService.getLessonWords(req.user.id, lessonIndex, req.user, bookId);
  if (!result) {
    res.status(404);
    throw new Error('课程不存在');
  }
  res.json(result);
});

exports.next = asyncHandler(async (req, res) => {
  const word = await learnService.getNextWord(req.user.id);
  if (!word) {
    res.status(404);
    throw new Error('没有更多待学单词');
  }
  res.json(word);
});

exports.learned = asyncHandler(async (req, res) => {
  const { wordId } = req.body;
  await learnService.markLearned(req.user.id, wordId);
  res.json({ ok: true });
});
