const Joi = require('joi').extend(require('@joi/date'))

const dateValidation = (inputDate, arrivalDate = 'now') => {
  let lessErrorMessage = 'Date must not be in the future.'
  let anyErrorMessage = 'Date must be valid and cannot be in the future.'

  if (arrivalDate !== 'now') {
    lessErrorMessage = `Date must not be after ${arrivalDate}.`
    anyErrorMessage = `Date must be valid and cannot be after ${arrivalDate}.`
  }

  return Joi.object({
    date: Joi.date().format('YYYY-MM-DD').less(arrivalDate).required()
      .messages({
        'any.required': 'Date is required.',
        'date.format': 'Date must be in the format YYYY-MM-DD.',
        'date.less': lessErrorMessage,
        '*': anyErrorMessage
      })
  }).validate(inputDate)
}

module.exports = dateValidation
