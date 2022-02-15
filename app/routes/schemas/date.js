const Joi = require('joi')

module.exports = Joi.object({
  date: Joi.date().less('now').iso().raw().required()
})
