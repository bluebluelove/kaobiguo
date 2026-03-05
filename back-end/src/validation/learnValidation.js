const Joi = require('joi');

const learnedSchema = Joi.object({
  wordId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
});

const setSettingsSchema = Joi.object({
  wordsPerDay: Joi.number().integer().min(5).max(100).required().messages({
    'number.min': '每日词数须在 5～100 之间',
    'number.max': '每日词数须在 5～100 之间',
  }),
});

const validateLearned = (req, res, next) => {
  const { error } = learnedSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

const validateSetSettings = (req, res, next) => {
  const { error } = setSettingsSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

module.exports = { validateLearned, validateSetSettings };
