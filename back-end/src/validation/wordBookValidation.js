const Joi = require('joi');

const setCurrentSchema = Joi.object({
  bookId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
});

const validateSetCurrentBook = (req, res, next) => {
  const { error } = setCurrentSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

module.exports = { validateSetCurrentBook };
