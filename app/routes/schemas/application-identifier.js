const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w{10}$/).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The application identifier cannot be empty'
            break
          default:
            err.message = 'The application identifier is invalid'
            break
        }
      })
      return errors
    })
}
