const Joi = require('joi')

module.exports = {
  frn: Joi.string().regex(/^\d{10}$/).required()
    .messages({
      'string.pattern.base': 'The FRN must consist of 10 numeric digits.',
      'any.required': 'The FRN is required.',
      '*': 'An FRN consisting of 10 numeric digits must be provided.'
    })
}
//   frn: Joi.number().integer().greater(999999999).less(10000000000).required()
//     .error(errors => {
//       errors.forEach(err => { err.message = 'The FRN must be 10 digits' })
//       return errors
//     })
// }

// does min/max make more sense here?
