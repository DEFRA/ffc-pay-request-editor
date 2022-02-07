const Joi = require('joi')

module.exports = {
  debtType: Joi.string().required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'Debt type cannot be empty'
            break
          default:
            err.message = 'Debt type is invalid'
            break
        }
      })
      return errors
    })
}
