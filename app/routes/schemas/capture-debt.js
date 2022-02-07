const Joi = require('joi')
const schemeSchema = require('./scheme')
const frnSchema = require('./frn')
const applicationIdentifierSchema = require('./application-identifier')
const netSchema = require('./net')
const debtDateSchema = require('./debt-date')
const debtMonthSchema = require('./debt-month')
const debtYearSchema = require('./debt-year')

module.exports = Joi.object({
  ...schemeSchema,
  ...frnSchema,
  ...applicationIdentifierSchema,
  ...netSchema,
  ...debtDateSchema,
  ...debtMonthSchema,
  ...debtYearSchema
})
