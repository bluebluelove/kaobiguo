const asyncHandler = require('express-async-handler');
const reviewService = require('../services/reviewService');

exports.today = asyncHandler(async (req, res) => {
  const result = await reviewService.getTodayReviewList(req.user.id);
  res.json(result);
});

exports.result = asyncHandler(async (req, res) => {
  const { wordId, known } = req.body;
  await reviewService.submitResult(req.user.id, wordId, known);
  res.json({ ok: true });
});
