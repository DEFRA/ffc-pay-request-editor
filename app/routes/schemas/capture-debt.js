const Joi = require('joi')
const schemeSchema = require('./scheme')
const frnSchema = require('./frn')
const net = require('./net')
const debtDateSchema = require('./debt-date')

module.exports = Joi.object({
  ...schemeSchema,
  ...frnSchema,
  ...net,
  ...debtDateSchema
})
