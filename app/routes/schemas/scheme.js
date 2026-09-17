const { getSchemeNames } = require('ffc-pay-schemes')
const Joi = require('joi')

const schemeNames = Object.values(getSchemeNames())

module.exports = {
  scheme: Joi.string().valid(...schemeNames).required()
    .error(errors => errors[0])
    .messages({
      'any.only': `The scheme must be one of the following: ${schemeNames.join(', ')}`,
      'any.required': 'A scheme must be selected'
    })
}
