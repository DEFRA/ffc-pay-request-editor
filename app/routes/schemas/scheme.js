const Joi = require('joi')

module.exports = {
  scheme: Joi.string().valid('SFI22', 'SFI Pilot', 'CS', 'BPS', 'FDMR', 'SFI23', 'Vet Visits', 'Lump Sums', 'Delinked').required()
    .messages({
      'any.only': 'The scheme must be one of the following: SFI22, SFI Pilot, Lump Sums, Vet Visits, CS, BPS, FDMR, SFI23, Delinked.',
      'any.required': 'A scheme must be selected.'
    })
}
