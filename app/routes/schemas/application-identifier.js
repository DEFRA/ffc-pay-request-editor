const Joi = require('joi')

const minSize = 5
const maxSize = 50

module.exports = {
  applicationIdentifier: Joi.string()
    .required()
    .regex(/^\w*$/)
    .min(minSize)
    .max(maxSize)
    .messages({
      'any.required': 'The Agreement / claim number is required',
      'string.empty': 'The Agreement / claim number is required',
      'string.pattern.base': 'The Agreement / claim number must be a string consisting of alphanumeric characters and underscores',
      'string.min': 'The Agreement / claim number must be at least 5 characters long',
      'string.max': 'The Agreement / claim number cannot be more than 50 characters long',
      '*': 'Enter an Agreement / claim number'
    })
}
