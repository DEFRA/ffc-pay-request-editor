const Joi = require('joi')

module.exports = {
  'debt-discovered-month': Joi.number().integer().min(1).max(12).required()
    .messages({
      'number.max': 'The debt month cannot be more than 12.',
      'number.min': 'The debt month cannot be less than 1.',
      'number.unsafe': 'The debt month is invalid.',
      'number.base': 'The debt month must be a number.',
      'any.required': 'The debt month is required.',
      '*': 'The debt month must be a number from 1 to 12.'
    })
    // .error(errors => {
    //   errors.forEach(err => {
    //     switch (err.code) {
    //       case 'number.less':
    //         err.message = 'The debt month cannot be more than 12.'
    //         break
    //       case 'number.greater':
    //         err.message = 'The debt month cannot be less than 1.'
    //         break
    //       case 'number.unsafe':
    //         err.message = 'The debt month is invalid.'
    //         break
    //       case 'number.base':
    //         if (err.local.value) {
    //           err.message = 'The debt month must be a number.'
    //         } else {
    //           err.message = 'The debt month cannot be empty.'
    //         }
    //         break
    //       default:
    //         err.message = 'The debt month must be between 1 and 12.'
    //         break
    //     }
    //   })
    //   return errors
    // })
}

// condense error messages using .messages(), use min() and max()
