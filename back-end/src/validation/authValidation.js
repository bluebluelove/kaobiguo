const Joi = require('joi');

const loginSchema = Joi.object({
  account: Joi.string().trim().email().max(128).required().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
  }),
  password: Joi.string().min(1).required().messages({
    'string.empty': '密码不能为空',
  }),
});

const sendCodeSchema = Joi.object({
  email: Joi.string().trim().email().max(128).required().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
  }),
  type: Joi.string().valid('register', 'login').required().messages({
    'any.only': 'type 须为 register 或 login',
  }),
});

const registerSchema = Joi.object({
  account: Joi.string().trim().email().max(128).required().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': '密码至少 6 位',
  }),
  nickname: Joi.string().trim().max(64).allow('').optional(),
  code: Joi.string().trim().length(6).required().messages({
    'string.length': '验证码为 6 位数字',
  }),
});

const loginByCodeSchema = Joi.object({
  account: Joi.string().trim().email().max(128).required().messages({
    'string.empty': '邮箱不能为空',
    'string.email': '请输入有效的邮箱地址',
  }),
  code: Joi.string().trim().length(6).required().messages({
    'string.length': '验证码为 6 位数字',
  }),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

const validateSendCode = (req, res, next) => {
  const { error } = sendCodeSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

const validateLoginByCode = (req, res, next) => {
  const { error } = loginByCodeSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

module.exports = { validateLogin, validateRegister, validateSendCode, validateLoginByCode };
