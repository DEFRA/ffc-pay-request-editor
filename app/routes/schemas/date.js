const Joi = require('joi').extend(require('@joi/date'))

const dateValidation = (inputDate, arrivalDate = 'now') => {
  return Joi.object({
    date: Joi.date().format('YYYY-MM-DD').less(arrivalDate).required()
      .messages({
        'any.required': 'Date is required.',
        'date.format': 'Date must be in the format YYYY-MM-DD.',
        'date.less': 'Date must not be in the future.',
        '*': 'Date must be valid and cannot be in the future.'
      })
  }).validate(inputDate)
}

module.exports = dateValidation

// specific error messages, i.e. 'date must be in the format YYY-MM-DD' or 'date cannot be in the future'
