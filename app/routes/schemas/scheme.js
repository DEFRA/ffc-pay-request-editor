const Joi = require('joi')

module.exports = {
  scheme: Joi.string().valid('SFI', 'SFI Pilot', 'CS', 'BPS', 'FDMR', 'Vet Visits', 'Lump Sums').required()
    .messages({
      'any.only': 'The scheme must be one of the following: SFI, SFI Pilot, CS, BPS, FDMR, Vet Visits, Lump Sums.',
      'any.required': 'A scheme must be selected.'
    })
}
