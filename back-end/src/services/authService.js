const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, toUserResponse } = require('../utils/jwtHelper');
const verificationCodeService = require('./verificationCodeService');
const emailService = require('./emailService');
const config = require('../config/config');

const login = async (account, password) => {
  const user = await User.findOne({ where: { account: account.trim() } });
  if (!user) {
    const err = new Error('账号或密码错误');
    err.statusCode = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('账号或密码错误');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user.id);
  return { token, user: toUserResponse(user) };
};

/** 发送验证码到邮箱（QQ 邮箱）；开发环境未配置邮件时使用固定码 123456 */
const sendCode = async (email, type) => {
  const hasMail = config.mail.user && config.mail.pass;
  let code;
  if (config.nodeEnv === 'development' && !hasMail) {
    code = '123456';
    verificationCodeService.setCode(email, type, code, config.verificationCodeExpireMinutes);
    console.warn('[开发] 未配置 MAIL_USER/MAIL_PASS，验证码为 123456');
    return { ok: true };
  }
  code = verificationCodeService.generateCode();
  verificationCodeService.setCode(email, type, code, config.verificationCodeExpireMinutes);
  try {
    await emailService.sendVerificationCode(email, code, type);
  } catch (err) {
    console.error('[邮件发送失败]', err.message);
    throw new Error(err.message || '邮件发送失败，请检查 .env 中 QQ 邮箱授权码是否有效');
  }
  return { ok: true };
};

/** 验证码登录（无需密码） */
const loginByCode = async (account, code) => {
  const ok = verificationCodeService.verifyCode(account, 'login', code);
  if (!ok) {
    const err = new Error('验证码错误或已过期');
    err.statusCode = 401;
    throw err;
  }
  const user = await User.findOne({ where: { account: account.trim() } });
  if (!user) {
    const err = new Error('该邮箱尚未注册，请先注册');
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user.id);
  return { token, user: toUserResponse(user) };
};

const register = async (account, password, nickname = '', code) => {
  const ok = verificationCodeService.verifyCode(account, 'register', code);
  if (!ok) {
    const err = new Error('验证码错误或已过期，请重新点击「发送验证码」获取新验证码');
    err.statusCode = 400;
    throw err;
  }
  const existing = await User.findOne({ where: { account: account.trim() } });
  if (existing) {
    const err = new Error('该邮箱已被注册');
    err.statusCode = 400;
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    account: account.trim(),
    password_hash: hash,
    nickname: (nickname || '').trim() || null,
  });
  const token = generateToken(user.id);
  return { token, user: toUserResponse(user) };
};

const getMe = (user) => {
  return toUserResponse(user);
};

module.exports = { login, loginByCode, sendCode, register, getMe };
