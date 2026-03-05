const Joi = require('joi');

const resultSchema = Joi.object({
  wordId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
  known: Joi.boolean().required(),
});

const validateReviewResult = (req, res, next) => {
  const { error } = resultSchema.validate(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error.details[0].message));
  }
  next();
};

module.exports = { validateReviewResult };
