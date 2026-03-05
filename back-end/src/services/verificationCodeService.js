/**
 * 验证码存储（内存，重启后清空）。生产环境可改为 Redis。
 * key: `${email}:${type}` -> { code, expiresAt }
 */
const store = new Map();
const CODE_LENGTH = 6;
const DIGITS = '0123456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }
  return code;
}

function getKey(email, type) {
  return `${String(email).trim().toLowerCase()}:${type}`;
}

function setCode(email, type, code, expireMinutes = 5) {
  const key = getKey(email, type);
  const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000);
  store.set(key, { code, expiresAt });
}

function verifyCode(email, type, code) {
  const key = getKey(email, type);
  const entry = store.get(key);
  if (!entry) return false;
  if (new Date() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  if (String(code).trim() !== entry.code) return false;
  store.delete(key);
  return true;
}

function getCode(email, type) {
  const key = getKey(email, type);
  const entry = store.get(key);
  if (!entry || new Date() > entry.expiresAt) return null;
  return entry.code;
}

module.exports = {
  generateCode,
  setCode,
  verifyCode,
  getCode,
};
