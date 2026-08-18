const Joi = require('joi')

const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../constants/debt-types')

module.exports = Joi.object({
  day: Joi.number().integer().min(1).max(31).required()
    .error(errors => {
      errors.forEach(err => {
        err.message = 'Day must be a number'
      })
      return errors
    }),
  month: Joi.number().integer().min(1).max(12).required().error(errors => {
    errors.forEach(err => {
      err.message = 'Month must be a number'
    })
    return errors
  }),
  year: Joi.number().integer().min(2015).max(9999).required().error(errors => {
    errors.forEach(err => {
      err.message = 'Year must be a number'
    })
    return errors
  }),
  'debt-type': Joi.string().valid(ADMINISTRATIVE, IRREGULAR).required(),
  'invoice-number': Joi.string().required(),
  'payment-request-id': Joi.number().integer().required()
})
