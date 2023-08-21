const Joi = require('joi')

module.exports = {
  scheme: Joi.string().valid('SFI', 'SFI Pilot', 'CS', 'BPS', 'FDMR', 'SFI23', 'Vet Visits', 'Lump Sums').required()
    .messages({
      'any.only': 'The scheme must be one of the following: SFI, SFI Pilot, Lump Sums, Vet Visits, CS, BPS, FDMR, SFI23.',
      'any.required': 'A scheme must be selected.'
    })
}
