const Joi = require('joi').extend(require('@joi/date'))

const dateValidation = (inputDate, arrivalDate = 'now') => {
  return Joi.object({
    date: Joi.date().format('YYYY-MM-DD').less(arrivalDate).required().messages({ '*': 'Date must be valid and cannot be in the future' })
  }).validate(inputDate)
}

module.exports = dateValidation
