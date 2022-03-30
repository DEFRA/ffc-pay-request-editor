const Joi = require('joi')

module.exports = {
  applicationIdentifier: Joi.string().regex(/^\w{15}$/).required()
    .error(errors => {
      errors.forEach(err => { err.message = 'The agreement number must be 15 digits' })
      return errors
    })
}
