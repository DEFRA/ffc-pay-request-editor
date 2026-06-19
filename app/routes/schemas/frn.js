const Joi = require('joi')

module.exports = {
  frn: Joi.number().integer().min(1000000000).max(9999999999).required()
    .messages({
      'number.base': 'The FRN must be a number',
      'number.min': 'The FRN must be 10 digits',
      'number.max': 'The FRN must be 10 digits',
      '*': 'Enter an FRN (Firm Reference Number)'
    })
}
