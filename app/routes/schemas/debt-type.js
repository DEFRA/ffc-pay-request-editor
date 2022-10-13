const Joi = require('joi')
const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../debt-types')

// const typeOfDebts = [ADMINISTRATIVE, IRREGULAR]
// const typeOfDebtsRegex = new RegExp(typeOfDebts.reduce((x, y) => x + '|' + y))

module.exports = {
  debtType: Joi.string().valid(ADMINISTRATIVE, IRREGULAR).required()
    .messages({
      'any.only': 'The type of debt must be either administrative or irregular.',
      'any.required': 'A type of debt must be selected.'
    })
    // .error(errors => {
    //   errors.forEach(err => { err.message = 'Select a type of debt' })
    //   return errors
    // })
}

// Consider using .valid() instead of regex
