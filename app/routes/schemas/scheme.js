const Joi = require('joi')

module.exports = {
  scheme: Joi.string().required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'Scheme cannot be empty.'
            break
          default:
            err.message = 'Scheme is invalid.'
            break
        }
      })
      return errors
    })
}
