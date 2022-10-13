const Joi = require('joi')

// const typeOfSchemes = ['SFI', 'SFI Pilot', 'LNR', 'Vet Visits', 'Lump Sums']
// const typeOfSchemesRegex = new RegExp(typeOfSchemes.reduce((x, y) => x + '|' + y))

module.exports = {
  scheme: Joi.string().valid('SFI', 'SFI Pilot', 'LNR', 'Vet Visits', 'Lump Sums').required()
    .messages({
      'any.only': 'The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums.',
      'any.required': 'A scheme must be selected.'
    })
    // .error(errors => {
    //   errors.forEach(err => { err.message = 'Select a scheme' })
    //   return errors
    // })
}

// could use .valid() instead of regex
