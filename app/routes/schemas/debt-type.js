const Joi = require('joi')
const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../constants/debt-types')

module.exports = {
  debtType: Joi.string().valid(ADMINISTRATIVE, IRREGULAR).required()
    .messages({
      'any.only': 'The type of debt must be either administrative or irregular.',
      'any.required': 'A type of debt must be selected.'
    })
}
