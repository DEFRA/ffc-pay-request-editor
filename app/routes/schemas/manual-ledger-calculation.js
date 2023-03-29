const Joi = require('joi')

module.exports = Joi.object({
  paymentRequestId: Joi.number().integer().positive().required(),
  'ar-value': Joi.number().required(),
  'ap-value': Joi.number().required()
}).options({ allowUnknown: true })
