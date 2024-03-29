const Joi = require('joi')

module.exports = {
  net: Joi.number().positive().allow(0).less(1000000000).required()
    .messages({
      'number.positive': 'The net value must be positive.',
      'number.less': 'The net value must be less than £1,000,000,000.',
      'number.unsafe': 'The net value must be less than £1,000,000,000.',
      'number.base': 'The net value must be a number without commas.',
      'any.required': 'The net value is required.',
      '*': 'The net value must be between £0 and £1,000,000,000.'
    })
}
