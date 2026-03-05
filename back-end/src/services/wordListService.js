const { UserWordList, Word } = require('../models');

const getList = async (userId) => {
  const rows = await UserWordList.findAll({
    where: { user_id: userId },
    include: [{ model: Word, as: 'Word', attributes: ['id', 'word', 'phonetic', 'definitions'] }],
    order: [['created_at', 'DESC']],
  });

  const list = rows
    .filter((r) => r.Word)
    .map((r) => ({
      wordId: r.word_id,
      id: r.Word.id,
      word: r.Word.word,
      phonetic: r.Word.phonetic,
      definitions: r.Word.definitions,
    }));

  return { list };
};

const addWord = async (userId, wordId) => {
  const wordIdNum = typeof wordId === 'string' ? parseInt(wordId, 10) : wordId;
  const word = await Word.findByPk(wordIdNum);
  if (!word) {
    const err = new Error('单词不存在');
    err.statusCode = 404;
    throw err;
  }

  const [record, created] = await UserWordList.findOrCreate({
    where: { user_id: userId, word_id: wordIdNum },
  });
  if (!created) {
    const err = new Error('已在生词本中');
    err.statusCode = 400;
    throw err;
  }
  return { ok: true };
};

const removeWord = async (userId, wordId) => {
  const wordIdNum = typeof wordId === 'string' ? parseInt(wordId, 10) : wordId;
  const deleted = await UserWordList.destroy({
    where: { user_id: userId, word_id: wordIdNum },
  });
  if (deleted === 0) {
    const err = new Error('生词本中无该词');
    err.statusCode = 404;
    throw err;
  }
  return { ok: true };
};

module.exports = { getList, addWord, removeWord };
