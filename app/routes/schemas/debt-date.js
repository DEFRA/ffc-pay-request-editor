const Joi = require('joi')

module.exports = {
  debtDate: Joi.number().integer().greater(0).less(32).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'Debt date cannot be negative.'
            break
          case 'number.greater':
            err.message = 'Debt date cannot exceed 31.'
            break
          case 'number.unsafe':
            err.message = 'Debt date is invalid.'
            break
          case 'number.base':
            err.message = 'Debt date must be a number.'
            break
          default:
            err.message = 'Debt date is invalid.'
            break
        }
      })
      return errors
    })
}
