const Joi = require('joi')

module.exports = {
  'debt-discovered-day': Joi.number().integer().min(1).max(31).required()
    .messages({
      'number.max': 'The debt day cannot be more than 31.',
      'number.min': 'The debt day cannot be less than 1.',
      'number.unsafe': 'The debt day is invalid.',
      'number.base': 'The debt day must be a number.',
      'any.required': 'The debt day is required',
      '*': 'The debt day must be a number from 1 to 31.'
    })
}
