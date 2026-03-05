const asyncHandler = require('express-async-handler');
const wordBookService = require('../services/wordBookService');

exports.list = asyncHandler(async (req, res) => {
  const result = await wordBookService.getBookList();
  res.json(result);
});

exports.current = asyncHandler(async (req, res) => {
  const result = await wordBookService.getCurrentBook(req.user.id);
  if (!result) {
    res.status(404);
    throw new Error('尚未选择词书');
  }
  res.json(result);
});

exports.setCurrent = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  await wordBookService.setCurrentBook(req.user.id, bookId);
  res.json({ ok: true });
});
