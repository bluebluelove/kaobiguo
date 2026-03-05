const config = require('../config/config');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.statusCode) statusCode = err.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: config.nodeEnv === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
