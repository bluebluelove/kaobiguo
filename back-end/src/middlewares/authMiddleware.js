const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    res.status(401);
    throw new Error('未登录或 token 无效');
  }

  try {
    const decoded = jwt.verify(token, require('../config/config').jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('用户不存在');
    }
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('登录已过期或 token 无效');
    }
    throw e;
  }
});

module.exports = { protect };
