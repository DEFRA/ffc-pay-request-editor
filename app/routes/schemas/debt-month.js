const Joi = require('joi')

module.exports = {
  'debt-discovered-month': Joi.number().integer().greater(0).less(13).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The debt month cannot be more than 12.'
            break
          case 'number.greater':
            err.message = 'The debt month cannot be less than 1.'
            break
          case 'number.unsafe':
            err.message = 'The debt month is invalid.'
            break
          case 'number.base':
            if (err.local.value) {
              err.message = 'The debt month must be a number.'
            } else {
              err.message = 'The debt month cannot be empty.'
            }
            break
          default:
            err.message = 'The debt month must be between 1 and 12.'
            break
        }
      })
      return errors
    })
}
