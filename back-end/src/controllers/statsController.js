const asyncHandler = require('express-async-handler');
const statsService = require('../services/statsService');

exports.today = asyncHandler(async (req, res) => {
  const result = await statsService.getTodayStats(req.user.id);
  res.json(result);
});

exports.bookProgress = asyncHandler(async (req, res) => {
  const result = await statsService.getBookProgress(req.user.id);
  res.json(result);
});
