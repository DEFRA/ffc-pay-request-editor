const Joi = require('joi')

module.exports = {
  frn: Joi.number().integer().greater(999999999).less(10000000000).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The FRN is too long'
            break
          case 'number.greater':
            err.message = 'The FRN is too short'
            break
          case 'number.unsafe':
            err.message = 'The FRN is too long'
            break
          case 'number.base':
            if (err.local.value) {
              err.message = 'The FRN must be a number'
            } else {
              err.message = 'The FRN cannot be empty'
            }
            break
          default:
            err.message = 'The FRN is invalid'
            break
        }
      })
      return errors
    })
}
