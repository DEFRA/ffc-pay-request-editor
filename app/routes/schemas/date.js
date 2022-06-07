const Joi = require('joi').extend(require('@joi/date'))

const dateValidation = (inputDate, arrivalDate = 'now') => {
  return Joi.object({
    date: Joi.date().less(arrivalDate).iso().raw().required().error(errors => {
      errors.forEach(err => { err.message = 'Debt cannot be discovered in the future' })
      return errors
    })
  }).validate(inputDate)
}
module.exports = dateValidation
