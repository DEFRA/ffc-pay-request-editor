const Joi = require('joi')

module.exports = {
  'debt-discovered-day': Joi.number().integer().greater(0).less(32).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The debt date cannot be less than 1'
            break
          case 'number.greater':
            err.message = 'The debt date cannot exceed 31'
            break
          case 'number.unsafe':
            err.message = 'The debt date is invalid'
            break
          case 'number.base':
            err.message = 'The debt date must be a number'
            break
          default:
            err.message = 'The debt date must be between 1 and 31'
            break
        }
      })
      return errors
    })
}
