const Joi = require('joi')

const LENGTH = 10

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w{10}$/).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The application identifier cannot be empty'
            break
          case 'string.pattern.base':
            if (err.local.value.length < LENGTH) {
              err.message = `The application identifier is too short. This must be ${LENGTH} characters`
            } else if (err.local.value.length > LENGTH) {
              err.message = `The application identifier is too long. This must be ${LENGTH} characters`
            } else {
              err.message = 'The application identifier can only have alphanumeric characters'
            }
            break
          default:
            err.message = 'The application identifier is invalid'
            break
        }
      })
      return errors
    })
}
