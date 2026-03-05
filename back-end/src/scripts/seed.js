/**
 * 种子脚本：创建示例词书与单词，便于本地联调。
 * 使用：node src/scripts/seed.js（需先配置 .env 并启动过至少一次以建表）
 */
require('dotenv').config();
const { sequelize, WordBook, Word, BookWord } = require('../models');

const sampleWords = [
  { word: 'abandon', phonetic: '/əˈbændən/', definitions: [{ pos: 'v.', meaning: '放弃；遗弃' }] },
  { word: 'ability', phonetic: '/əˈbɪləti/', definitions: [{ pos: 'n.', meaning: '能力' }] },
  { word: 'abstract', phonetic: '/ˈæbstrækt/', definitions: [{ pos: 'adj.', meaning: '抽象的' }, { pos: 'n.', meaning: '摘要' }] },
  { word: 'abundant', phonetic: '/əˈbʌndənt/', definitions: [{ pos: 'adj.', meaning: '丰富的' }] },
  { word: 'academic', phonetic: '/ˌækəˈdemɪk/', definitions: [{ pos: 'adj.', meaning: '学术的' }] },
];

async function seed() {
  try {
    await sequelize.authenticate();
    const [book] = await WordBook.findOrCreate({
      where: { name: '考研英语 5500 词（示例）' },
      defaults: { description: '示例词书，仅含少量单词', word_count: 0, exam_tag: '考研' },
    });

    for (let i = 0; i < sampleWords.length; i++) {
      const [word] = await Word.findOrCreate({
        where: { word: sampleWords[i].word },
        defaults: {
          phonetic: sampleWords[i].phonetic,
          definitions: sampleWords[i].definitions,
        },
      });
      await BookWord.findOrCreate({
        where: { book_id: book.id, word_id: word.id },
        defaults: { sort_order: i + 1 },
      });
    }

    await book.update({ word_count: sampleWords.length });
    console.log('Seed done. WordBook id:', book.id, ', words:', sampleWords.length);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
