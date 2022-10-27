const Joi = require('joi')

module.exports = {
  'debt-discovered-month': Joi.number().integer().min(1).max(12).required()
    .messages({
      'number.max': 'The debt month cannot be more than 12.',
      'number.min': 'The debt month cannot be less than 1.',
      'number.unsafe': 'The debt month is invalid.',
      'number.base': 'The debt month must be a number.',
      'any.required': 'The debt month is required.',
      '*': 'The debt month must be a number from 1 to 12.'
    })
}
