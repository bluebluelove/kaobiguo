const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

exports.login = asyncHandler(async (req, res) => {
  const { account, password } = req.body;
  const result = await authService.login(account, password);
  res.json(result);
});

exports.sendCode = asyncHandler(async (req, res) => {
  const { email, type } = req.body;
  await authService.sendCode(email, type);
  res.json({ ok: true, message: '验证码已发送到您的邮箱' });
});

exports.loginByCode = asyncHandler(async (req, res) => {
  const { account, code } = req.body;
  const result = await authService.loginByCode(account, code);
  res.json(result);
});

exports.register = asyncHandler(async (req, res) => {
  const { account, password, nickname, code } = req.body;
  const result = await authService.register(account, password, nickname, code);
  res.status(201).json(result);
});

exports.me = asyncHandler(async (req, res) => {
  const user = authService.getMe(req.user);
  res.json(user);
});
