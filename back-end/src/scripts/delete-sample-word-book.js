/**
 * 删除「考研英语 5500 词」示例词书（约 5 词的那本）。
 * 使用：node src/scripts/delete-sample-word-book.js
 */
require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize, WordBook } = require('../models');

async function run() {
  await sequelize.authenticate();

  const book = await WordBook.findOne({
    where: {
      [Op.or]: [
        { name: '考研英语 5500 词（示例）' },
        { name: '考研英语 5500 词 (示例)' },
      ],
    },
  });

  if (!book) {
    console.log('未找到示例词书（考研英语 5500 词），可能已删除或名称不一致。');
    process.exit(0);
    return;
  }

  await book.destroy();
  console.log('已删除词书:', book.name, '(id:', book.id, ', 约', book.word_count, '词)');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
