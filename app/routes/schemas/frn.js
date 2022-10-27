const Joi = require('joi')

module.exports = {
  frn: Joi.string().regex(/^\d{10}$/).required()
    .messages({
      'string.pattern.base': 'The FRN must consist of 10 numeric digits.',
      'any.required': 'The FRN is required.',
      '*': 'An FRN consisting of 10 numeric digits must be provided.'
    })
}
