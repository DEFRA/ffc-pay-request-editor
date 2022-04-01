const Joi = require('joi')
const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../debt-types')

const typeOfDebts = [ADMINISTRATIVE, IRREGULAR]
const typeOfDebtsRegex = new RegExp(typeOfDebts.reduce((x, y) => x + '|' + y))

module.exports = {
  debtType: Joi.string().regex(typeOfDebtsRegex).required()
    .error(errors => {
      errors.forEach(err => { err.message = 'Select a type of debt' })
      return errors
    })
}
