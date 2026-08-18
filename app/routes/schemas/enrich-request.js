const Joi = require('joi')

const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../constants/debt-types')

const minDayMonth = 1
const maxDay = 31
const maxMonth = 12
const minYear = 2015
const maxYear = 9999

module.exports = Joi.object({
  day: Joi.number().integer().min(minDayMonth).max(maxDay).required()
    .error(errors => {
      errors.forEach(err => {
        err.message = 'Enter valid day'
      })
      return errors
    }),
  month: Joi.number().integer().min(minDayMonth).max(maxMonth).required().error(errors => {
    errors.forEach(err => {
      err.message = 'Enter valid month'
    })
    return errors
  }),
  year: Joi.number().integer().min(minYear).max(maxYear).required().error(errors => {
    errors.forEach(err => {
      err.message = 'Enter valid year'
    })
    return errors
  }),
  'debt-type': Joi.string().valid(ADMINISTRATIVE, IRREGULAR).required(),
  'invoice-number': Joi.string().required(),
  'payment-request-id': Joi.number().integer().required()
})
