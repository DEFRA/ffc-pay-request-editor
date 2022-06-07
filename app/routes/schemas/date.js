const Joi = require('joi')
const moment = require('moment')

const dateValidation = (inputDate, arrivalDate = 'now') => {
  return Joi.object({
    date: Joi.date().custom(isValidDate).less(arrivalDate).iso().raw().required().messages({
      '*': 'Debt cannot be discovered in the future',
      'any.custom': 'Date must be valid'
    })
  }).validate(inputDate)
}

const isValidDate = (value, _helpers) => {
  const date = moment(value)
  if (!date.isValid()) {
    throw new Error('Invalid date')
  }
  return value
}

module.exports = dateValidation
