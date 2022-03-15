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
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The type of debt cannot be empty.'
            break
          case 'string.pattern.base':
            err.message = `The type of debt can only be ${typeOfDebts}.`
            break
          default:
            err.message = 'The type of debt is invalid.'
            break
        }
      })
      return errors
    })
}
