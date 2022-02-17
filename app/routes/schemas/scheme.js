const Joi = require('joi')

const typeOfSchemes = ['SFI', 'SFI Pilot']
const typeOfSchemesRegex = new RegExp(typeOfSchemes.reduce((x, y) => x + '|' + y))

module.exports = {
  scheme: Joi.string().regex(typeOfSchemesRegex).required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.code) {
          case 'string.empty':
            err.message = 'The scheme cannot be empty'
            break
          case 'string.pattern.base':
            err.message = `The scheme can only be ${typeOfSchemes}`
            break
          default:
            err.message = 'The scheme is invalid'
            break
        }
      })
      return errors
    })
}
