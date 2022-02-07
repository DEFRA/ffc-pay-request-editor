const Joi = require('joi')

module.exports = {
  scheme: Joi.string().required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The scheme cannot be empty'
            break
          default:
            err.message = 'The scheme is invalid'
            break
        }
      })
      return errors
    })
}
