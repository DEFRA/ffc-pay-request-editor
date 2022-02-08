const Joi = require('joi')
const schemeSchema = require('./scheme')
const frnSchema = require('./frn')
const applicationIdentifierSchema = require('./application-identifier')
const netSchema = require('./net')
const debtType = require('./debt-type')
const debtDaySchema = require('./debt-day')
const debtMonthSchema = require('./debt-month')
const debtYearSchema = require('./debt-year')

module.exports = Joi.object({
  ...schemeSchema,
  ...frnSchema,
  ...applicationIdentifierSchema,
  ...netSchema,
  ...debtType,
  ...debtDaySchema,
  ...debtMonthSchema,
  ...debtYearSchema
})
