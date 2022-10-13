const Joi = require('joi')

module.exports = {
  'debt-discovered-day': Joi.number().integer().min(1).max(31).required()
    .messages({
      'number.max': 'The debt day cannot be more than 31.',
      'number.min': 'The debt day cannot be less than 1.',
      'number.unsafe': 'The debt day is invalid.',
      'number.base': 'The debt day must be a number.',
      'any.required': 'The debt day is required',
      '*': 'The debt day must be a number from 1 to 31.'
    })
/*     .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'number.less':
            err.message = 'The debt day cannot be more than 31.'
            break
          case 'number.greater':
            err.message = 'The debt day cannot be less than 1.'
            break
          case 'number.unsafe':
            err.message = 'The debt day is invalid.'
            break
          case 'number.base':
            if (err.local.value) {
              err.message = 'The debt day must be a number.'
            } else {
              err.message = 'The debt day cannot be empty.'
            }
            break
          default:
            err.message = 'The debt day must be between 1 and 31.'
            break
        }
      })
      return errors
    }) */
}
