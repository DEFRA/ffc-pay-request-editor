const Joi = require('joi')

module.exports = {
  net: Joi.number().precision(2).greater(0).less(1000000000).required()
    .error(errors => {
      errors.forEach(err => { err.message = 'Enter a net value' })
      return errors
    })
}
