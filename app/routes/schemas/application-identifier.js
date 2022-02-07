const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.number().integer().greater(999999999).less(10000000000).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The application identifier is too long'
            break
          case 'number.greater':
            err.message = 'The application identifier is too short'
            break
          case 'number.unsafe':
            err.message = 'The application identifier is too long'
            break
          case 'number.base':
            err.message = 'The application identifier must be a number'
            break
          default:
            err.message = 'The application identifier is invalid'
            break
        }
      })
      return errors
    })
}
