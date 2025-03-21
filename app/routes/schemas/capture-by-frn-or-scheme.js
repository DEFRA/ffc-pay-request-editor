const Joi = require('joi')
const schemeNames = require('../../constants/scheme-names')

const minFRN = 1000000000
const maxFRN = 9999999999

module.exports = Joi.object({
  scheme: Joi.string().valid(...schemeNames).allow('').optional()
    .messages({
      'any.only': 'The scheme chosen must be a valid scheme supported by the Payment Hub.'
    }),
  frn: Joi.number().integer().min(minFRN).max(maxFRN).allow('').optional()
    .messages({
      'number.base': 'The FRN must be a number.',
      'number.min': 'The FRN must be 10 digits.',
      'number.max': 'The FRN must be 10 digits.',
      '*': 'The FRN must be a 10 digit number.'
    })
})
