const Joi = require('joi')

module.exports = {
  net: Joi.number().precision(2).greater(0).less(1000000000).required()
    .messages({
      'number.greater': 'The net value must be greater than £0.',
      'number.less': 'The net value must be less than £1,000,000,000.',
      'number.unsafe': 'The net value must be less than £1,000,000,000.',
      'number.base': 'The net value must be a number without commas.',
      'any.required': 'The net value is required.',
      '*': 'The net value must be between £0 and £1,000,000,000.'
    })
}
