const Joi = require('joi')

const typeOfSchemes = ['SFI', 'SFI Pilot', 'LNR', 'Vet Visits', 'Lump Sumps']
const typeOfSchemesRegex = new RegExp(typeOfSchemes.reduce((x, y) => x + '|' + y))

module.exports = {
  scheme: Joi.string().regex(typeOfSchemesRegex).required()
    .error(errors => {
      errors.forEach(err => { err.message = 'Select a scheme' })
      return errors
    })
}
