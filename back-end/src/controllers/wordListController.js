const asyncHandler = require('express-async-handler');
const wordListService = require('../services/wordListService');

exports.getList = asyncHandler(async (req, res) => {
  const result = await wordListService.getList(req.user.id);
  res.json(result);
});

exports.addWord = asyncHandler(async (req, res) => {
  const { wordId } = req.body;
  await wordListService.addWord(req.user.id, wordId);
  res.status(201).json({ ok: true });
});

exports.removeWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  await wordListService.removeWord(req.user.id, wordId);
  res.json({ ok: true });
});
