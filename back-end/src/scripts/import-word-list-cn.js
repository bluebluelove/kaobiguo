/**
 * 从「带中文释义的词表」导入：解析你文件里的单词+释义，用 API 只拉取音标和发音。
 *
 * 支持两种格式（每行一条）：
 *   ① 制表符分隔：单词\t词性. 释义 …  例如：boat	n. 小船；轮船 v. 划船
 *   ② 序号开头：序号 单词 词性. 释义 …  例如：1 boat n. 小船;轮船 v. 划船
 *
 * 用法（在 back-end 目录下）：
 *   node src/scripts/import-word-list-cn.js --book "词书名称" --file word-lists/文件名.txt
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, WordBook, Word, BookWord } = require('../models');

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const DELAY_MS = 400;

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

const POS_LIST = 'n\\.|v\\.|adj\\.|adv\\.|num\\.|prep\\.|conj\\.|interj\\.|pron\\.|vi\\.|vt\\.|abbr\\.|int\\.';
const POS_PATTERN = new RegExp(`(${POS_LIST})\\s*([\\s\\S]*?)(?=\\s*(?:${POS_LIST})|$)`, 'g');

/**
 * 从 rest 中解析出 definitions
 */
function parseDefinitions(rest) {
  if (!rest || !rest.trim()) return [];
  const definitions = [];
  let m;
  POS_PATTERN.lastIndex = 0;
  while ((m = POS_PATTERN.exec(rest)) !== null) {
    const meaning = m[2].trim().replace(/\s+/g, ' ').trim();
    if (meaning) definitions.push({ pos: m[1], meaning });
  }
  return definitions;
}

/**
 * 解析一行。支持：
 *  ① 制表符：word\t词性. 释义 …
 *  ② 序号开头：序号 word 词性. 释义 …
 * 返回 { word, definitions } 或 null
 */
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let word = '';
  let rest = '';

  if (trimmed.includes('\t')) {
    const idx = trimmed.indexOf('\t');
    word = trimmed.slice(0, idx).trim();
    rest = trimmed.slice(idx + 1).trim();
  } else {
    const headMatch = trimmed.match(/^\s*(\d+)\s+([a-zA-Z]+)\s+(.*)$/);
    if (!headMatch) return null;
    word = headMatch[2];
    rest = headMatch[3].trim();
  }

  if (!word || !/^[a-zA-Z]/.test(word)) return null;
  word = word.toLowerCase().trim();
  const definitions = parseDefinitions(rest);
  return { word, definitions };
}

function loadLines(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) throw new Error(`文件不存在: ${fullPath}`);
  return fs.readFileSync(fullPath, 'utf-8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

/** 只从 API 取音标和发音 URL */
async function fetchPhoneticFromAPI(word) {
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
  return { phonetic, pronunciation_url: audioUrl || null };
}

async function run() {
  const { bookName, filePath } = parseArgs();
  if (!bookName || !filePath) {
    console.error('用法: node src/scripts/import-word-list-cn.js --book "词书名称" --file <带中文释义的词表>');
    process.exit(1);
  }

  const lines = loadLines(filePath);
  const entries = [];
  const seen = new Set();
  let parseFail = 0;
  let duplicate = 0;
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      parseFail++;
      continue;
    }
    if (seen.has(parsed.word)) {
      duplicate++;
      continue;
    }
    seen.add(parsed.word);
    entries.push(parsed);
  }
  console.log('解析到', entries.length, '个词条（保留你文件里的中文释义，音标用 API 拉取）');
  if (duplicate > 0 || parseFail > 0) {
    console.log('  - 去重跳过:', duplicate, '行（同一单词只保留第一次出现）');
    if (parseFail > 0) console.log('  - 解析失败:', parseFail, '行');
  }

  await sequelize.authenticate();

  const [book] = await WordBook.findOrCreate({
    where: { name: bookName },
    defaults: { description: `导入自 ${filePath}`, word_count: 0, exam_tag: '' },
  });
  console.log('词书:', book.name, 'id:', book.id);

  let nextSortOrder = (await BookWord.max('sort_order', { where: { book_id: book.id } })) || 0;
  let done = 0;
  let skip = 0;
  for (let i = 0; i < entries.length; i++) {
    const { word, definitions } = entries[i];
    await sleep(DELAY_MS);
    const apiData = await fetchPhoneticFromAPI(word);
    const phonetic = apiData ? apiData.phonetic : null;
    const pronunciation_url = apiData ? apiData.pronunciation_url : null;
    if (!apiData) console.warn('未取到音标:', word);

    const [wordRow] = await Word.findOrCreate({
      where: { word },
      defaults: {
        phonetic: phonetic || null,
        definitions: definitions.length ? definitions : null,
        pronunciation_url,
      },
    });
    const [bw, created] = await BookWord.findOrCreate({
      where: { book_id: book.id, word_id: wordRow.id },
      defaults: { sort_order: nextSortOrder + 1 },
    });
    if (created) nextSortOrder++;
    done++;
    if (done % 50 === 0) console.log('已导入', done, '个');
  }

  const totalInBook = await BookWord.count({ where: { book_id: book.id } });
  await book.update({ word_count: totalInBook });
  console.log('完成. 本批处理:', done, '个；该词书当前共', totalInBook, '个词');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
