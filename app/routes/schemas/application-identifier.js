const Joi = require('joi')

const LENGTH = 15

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w{15}$/).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The agreement number cannot be empty.'
            break
          case 'string.pattern.base':
            if (err.local.value.length < LENGTH) {
              err.message = `The agreement number is too short. This must be ${LENGTH} characters.`
            } else if (err.local.value.length > LENGTH) {
              err.message = `The agreement number is too long. This must be ${LENGTH} characters.`
            } else {
              err.message = 'The agreement number can only have alphanumeric characters.'
            }
            break
          default:
            err.message = 'The agreement number is invalid.'
            break
        }
      })
      return errors
    })
}
