const Joi = require('joi')

module.exports = {
  'debt-discovered-year': Joi.number().integer().greater(1900).less(2100).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The debt year cannot be after 2100'
            break
          case 'number.greater':
            err.message = 'The debt year cannot be before 1900'
            break
          case 'number.unsafe':
            err.message = 'The debt year is invalid'
            break
          case 'number.base':
            if (err.local.value) {
              err.message = 'The debt year must be a number'
            } else {
              err.message = 'The debt year cannot be empty'
            }
            break
          default:
            err.message = 'The debt year must be between 1900 and 2100'
            break
        }
      })
      return errors
    })
}
