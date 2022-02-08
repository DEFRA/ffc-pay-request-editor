const Joi = require('joi')

module.exports = {
  debtType: Joi.string().required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The type of debt cannot be empty'
            break
          default:
            err.message = 'The type of debt is invalid'
            break
        }
      })
      return errors
    })
}
