const Joi = require('joi')

module.exports = Joi.object({
  frn: Joi.string().length(10).pattern(/^\d+$/).required()
})
