const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w*$/).required()
    .messages({
      'any.required': 'The agreement number is required.',
      'string.pattern.base': 'The agreement number must be a string consisting of alphanumeric characters and underscores.',
      'string.empty': 'The agreement number is invalid.',
      '*': 'The agreement number is invalid.'
    })
}
