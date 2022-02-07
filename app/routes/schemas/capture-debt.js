const Joi = require('joi')
const schemeSchema = require('./scheme')
const frnSchema = require('./frn')
const applicationIdentifierSchema = require('./application-identifier')
const netSchema = require('./net')
const debtDaySchema = require('./debt-day')
const debtMonthSchema = require('./debt-month')
const debtYearSchema = require('./debt-year')

module.exports = Joi.object({
  ...schemeSchema,
  ...frnSchema,
  ...applicationIdentifierSchema,
  ...netSchema,
  ...debtDaySchema,
  ...debtMonthSchema,
  ...debtYearSchema
})
