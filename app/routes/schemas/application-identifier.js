const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string()
    .required()
    .regex(/^\w*$/)
    .min(5)
    .messages({
      'any.required': 'The Agreement / claim number is required',
      'string.empty': 'The Agreement / claim number is required',
      'string.pattern.base': 'The Agreement / claim number must be a string consisting of alphanumeric characters and underscores',
      'string.min': 'The Agreement / claim number must be at least 5 characters long',
      '*': 'Enter an Agreement / claim number'
    })
}
