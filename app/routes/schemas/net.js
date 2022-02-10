const Joi = require('joi')

module.exports = {
  net: Joi.number().precision(2).greater(0).less(1000000000).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.greater':
            err.message = 'The net value must be greater than £0'
            break
          case 'number.less':
            err.message = 'The net value must be less than £1,000,000,000'
            break
          case 'number.unsafe':
            err.message = 'The net value must be less than £1,000,000,000'
            break
          case 'number.base':
            if (err.local.value) {
              err.message = 'The net value must be a number without commas'
            } else {
              err.message = 'The net value cannot be empty'
            }
            break
          default:
            err.message = 'The net value must be between £0 and £1,000,000,000'
            break
        }
      })
      return errors
    })
}
