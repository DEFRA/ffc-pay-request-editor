const Joi = require('joi')

module.exports = Joi.object({
  frn: Joi.number().required()
})
