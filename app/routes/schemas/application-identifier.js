const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string()
    .required()
    .regex(/^\w*$/)
    .min(5)
    .messages({
      'any.required': 'The agreement/claim number is required.',
      'string.empty': 'The agreement/claim number is required.',
      'string.pattern.base': 'The agreement/claim number must be a string consisting of alphanumeric characters and underscores.',
      'string.min': 'The agreement/claim number must be at least 5 characters long.',
      '*': 'The agreement/claim number is invalid.'
    })
}
