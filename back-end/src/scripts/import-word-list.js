/**
 * 从「词表文件」+ Free Dictionary API 导入词书到数据库。
 *
 * 用法（在 back-end 目录下）：
 *   node src/scripts/import-word-list.js --book "四级词汇" --file word-lists/cet4.txt
 *
 * 词表文件：每行一个英文单词，或传入 JSON 数组路径（如 ["abandon","ability",...]）。
 * 会创建/找到同名词书，并按顺序写入 words + book_words；音标和释义来自 API。
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, WordBook, Word, BookWord } = require('../models');

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DELAY_MS = 400; // 每个词请求间隔，避免限流

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  let bookName = '';
  let filePath = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--book' && args[i + 1]) {
      bookName = args[i + 1];
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    }
  }
  return { bookName, filePath };
}

function loadWordList(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`文件不存在: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf-8').trim();
  if (content.startsWith('[')) {
    try {
      return JSON.parse(content);
    } catch {
      throw new Error('JSON 词表解析失败');
    }
  }
  return content.split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

async function fetchWordFromAPI(word) {
  const url = `${API_BASE}/${encodeURIComponent(word)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const entry = data[0];
  let phonetic = '';
  let audioUrl = '';
  if (entry.phonetics && entry.phonetics.length) {
    const p = entry.phonetics.find((x) => x.text) || entry.phonetics[0];
    phonetic = p.text || '';
    audioUrl = p.audio || '';
  }
  const definitions = [];
  if (entry.meanings) {
    for (const m of entry.meanings) {
      const pos = m.partOfSpeech || '';
      for (const d of m.definitions || []) {
        definitions.push({ pos, meaning: d.definition || '' });
      }
    }
  }
  return { word: entry.word, phonetic, definitions, pronunciation_url: audioUrl || null };
}

async function run() {
  const { bookName, filePath } = parseArgs();
  if (!bookName || !filePath) {
    console.error('用法: node src/scripts/import-word-list.js --book "词书名称" --file <词表文件路径>');
    process.exit(1);
  }

  const rawList = loadWordList(filePath);
  const words = [...new Set(rawList)];
  console.log('词表去重后数量:', words.length);

  await sequelize.authenticate();

  const [book] = await WordBook.findOrCreate({
    where: { name: bookName },
    defaults: { description: `导入自 ${filePath}`, word_count: 0, exam_tag: '' },
  });
  console.log('词书:', book.name, 'id:', book.id);

  let done = 0;
  let skip = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    await sleep(DELAY_MS);
    const detail = await fetchWordFromAPI(w);
    if (!detail) {
      console.warn('跳过（API 无数据）:', w);
      skip++;
      continue;
    }
    const [wordRow] = await Word.findOrCreate({
      where: { word: detail.word },
      defaults: {
        phonetic: detail.phonetic || null,
        definitions: detail.definitions.length ? detail.definitions : null,
        pronunciation_url: detail.pronunciation_url,
      },
    });
    await BookWord.findOrCreate({
      where: { book_id: book.id, word_id: wordRow.id },
      defaults: { sort_order: done + 1 },
    });
    done++;
    if (done % 50 === 0) console.log('已导入', done, '个');
  }

  await book.update({ word_count: done });
  console.log('完成. 成功:', done, '跳过:', skip);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
