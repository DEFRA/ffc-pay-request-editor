const Joi = require('joi')
const frnSchema = require('./frn')

module.exports = Joi.object({
  ...frnSchema
})
