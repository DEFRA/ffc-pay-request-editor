const Joi = require('joi')

module.exports = Joi.object({
  day: Joi.number().integer().min(1).max(31).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(9999).required(),
  'debt-type': Joi.string().valid('irregular', 'admin').required(),
  'invoice-number': Joi.string().required()
})
