const Joi = require('joi')

module.exports = {
  scheme: Joi.string().valid('SFI', 'SFI Pilot', 'LNR', 'Vet Visits', 'Lump Sums').required()
    .messages({
      'any.only': 'The scheme must be one of the following: SFI, SFI Pilot, LNR, Vet Visits, Lump Sums.',
      'any.required': 'A scheme must be selected.'
    })
}
