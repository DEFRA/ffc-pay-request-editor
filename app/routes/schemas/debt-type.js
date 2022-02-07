const Joi = require('joi')

module.exports = {
  debtType: Joi.string().required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The FRN is too long.'
            break
          case 'number.greater':
            err.message = 'The FRN is too short.'
            break
          case 'number.unsafe':
            err.message = 'The FRN is too long.'
            break
          case 'number.base':
            err.message = 'The FRN must be a number.'
            break
          default:
            err.message = 'The FRN is invalid.'
            break
        }
      })
      return errors
    })
}
