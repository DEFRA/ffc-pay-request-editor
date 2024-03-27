const Joi = require('joi').extend(require('@joi/date'))

const dateValidation = (inputDate, arrivalDate = 'now') => {
  let lessErrorMessage = 'Date cannot be in the future.'
  let anyErrorMessage = 'Date must be valid and cannot be in the future.'

  if (arrivalDate !== 'now') {
    lessErrorMessage = `Date cannot be after ${formatDate(arrivalDate)}`
    anyErrorMessage = `Date must be valid and cannot be after ${formatDate(arrivalDate)}`
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

const formatDate = (date) => {
  const formattedDate = new Date(date)
  const day = formattedDate.getDate()
  const month = formattedDate.getMonth() + 1
  const year = formattedDate.getFullYear()
  return `${day} ${month} ${year}`
}

module.exports = dateValidation
