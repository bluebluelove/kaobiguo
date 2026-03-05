const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const toUserResponse = (user) => {
  const u = user.get ? user.get({ plain: true }) : user;
  return {
    id: u.id,
    account: u.account,
    nickname: u.nickname || '',
    avatar: u.avatar || null,
  };
};

module.exports = { generateToken, toUserResponse };
