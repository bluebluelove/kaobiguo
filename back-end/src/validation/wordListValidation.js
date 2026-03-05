const Joi = require('joi');

const addWordSchema = Joi.object({
  wordId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
});

const validateAddWord = (req, res, next) => {
  const { error } = addWordSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

module.exports = { validateAddWord };
