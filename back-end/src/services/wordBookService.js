const { WordBook, UserCurrentBook } = require('../models');

const getBookList = async () => {
  const list = await WordBook.findAll({
    order: [['id', 'ASC']],
    attributes: ['id', 'name', 'description', 'word_count', 'exam_tag'],
  });
  return { list: list.map((b) => b.get({ plain: true })) };
};

const getCurrentBook = async (userId) => {
  const row = await UserCurrentBook.findOne({
    where: { user_id: userId },
    order: [['updated_at', 'DESC']],
    include: [{ model: WordBook, as: 'WordBook', attributes: ['id', 'name', 'word_count'] }],
  });

  if (!row || !row.WordBook) {
    return null;
  }
  const b = row.WordBook.get({ plain: true });
  return { id: b.id, bookId: b.id, name: b.name, word_count: b.word_count };
};

const setCurrentBook = async (userId, bookId) => {
  const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
  const book = await WordBook.findByPk(bookIdNum);
  if (!book) {
    const err = new Error('词书不存在');
    err.statusCode = 404;
    throw err;
  }

  await UserCurrentBook.upsert(
    {
      user_id: userId,
      book_id: bookIdNum,
    },
    { conflictFields: ['user_id'] }
  );
  return { ok: true };
};

module.exports = { getBookList, getCurrentBook, setCurrentBook };
