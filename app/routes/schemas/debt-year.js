const Joi = require('joi')

const debtYearSchema = (yearNow) => {
  return {
    'debt-discovered-year': Joi.number().integer().min(2015).max(yearNow).required()
      .messages({
        'number.max': 'The debt year cannot be in the future.',
        'number.min': 'The debt year cannot be before 2015.',
        'number.unsafe': 'The debt year is invalid.',
        'number.base': 'The debt year must be a number.',
        'any.required': 'The debt year is required.',
        '*': 'The debt year must be a number from 2015 to the current year.'
      })
  }
}

module.exports = debtYearSchema
