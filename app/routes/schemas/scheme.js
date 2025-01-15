const Joi = require('joi')
const schemeNames = require('../../constants/scheme-names')

module.exports = {
  scheme: Joi.string().valid(...schemeNames).required()
    .messages({
      'any.only': `The scheme must be one of the following: ${schemeNames.join(', ')}.`,
      'any.required': 'A scheme must be selected.'
    })
}
