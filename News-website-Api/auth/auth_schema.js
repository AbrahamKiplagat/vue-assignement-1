const Joi = require('joi');

const authSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(6).required(),
});

module.exports = { authSchema };
