const Joi = require('joi')
const mqConfig = require('./mq-config')
const authConfig = require('./auth')

// Define config schema
const schema = Joi.object({
  processingActive: Joi.boolean().default(true),
  serviceName: Joi.string().default('Request Editor'),
  port: Joi.number().default(3001),
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  cookiePassword: Joi.string().required(),
  sessionTimeoutMinutes: Joi.number().default(30),
  staticCacheTimeoutMillis: Joi.number().default(7 * 24 * 60 * 60 * 1000), // 1 day
  googleTagManagerKey: Joi.string().default('GTM-5XJKV8F'),
  cookieOptions: Joi.object({
    ttl: Joi.number().default(1000 * 60 * 60 * 24 * 365),
    isSameSite: Joi.string().valid('Lax').default('Lax'),
    encoding: Joi.string().valid('base64json').default('base64json'),
    isSecure: Joi.bool().default(true),
    isHttpOnly: Joi.bool().default(true),
    clearInvalid: Joi.bool().default(false),
    strictHeader: Joi.bool().default(true)
  }),
  publishPollingInterval: Joi.number().default(10000), // 10 seconds
  debtsReportName: Joi.string().default('ffc-pay-debts-report.csv'),
  bannerEnabled: Joi.bool().default(false),
  bannerHeader: Joi.string().allow(null, ''),
  bannerText: Joi.string().allow(null, ''),
  bannerEmail: Joi.string().allow(null, '')
})

// Build config
const config = {
  processingActive: process.env.PROCESSING_ACTIVE,
  serviceName: process.env.SERVICE_NAME,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  cookiePassword: process.env.COOKIE_PASSWORD,
  sessionTimeoutMinutes: process.env.SESSION_TIMEOUT_IN_MINUTES,
  staticCacheTimeoutMillis: process.env.STATIC_CACHE_TIMEOUT_IN_MILLIS,
  googleTagManagerKey: process.env.GOOGLE_TAG_MANAGER_KEY,
  cookieOptions: {
    ttl: process.env.COOKIE_TTL_IN_MILLIS,
    isSameSite: 'Lax',
    encoding: 'base64json',
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    clearInvalid: false,
    strictHeader: true
  },
  publishPollingInterval: process.env.PUBLISH_POLLING_INTERVAL,
  debtsReportName: 'ffc-pay-debts-report.csv',
  bannerEnabled: process.env.BANNER_ENABLED,
  bannerHeader: process.env.BANNER_HEADER,
  bannerText: process.env.BANNER_TEXT,
  bannerEmail: process.env.BANNER_EMAIL
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the Joi validated value
const value = result.value

value.authConfig = authConfig

value.debtSubscription = mqConfig.debtSubscription
value.manualLedgerSubscription = mqConfig.manualLedgerSubscription
value.retentionSubscription = mqConfig.retentionSubscription
value.qcTopic = mqConfig.qcTopic
value.debtResponseTopic = mqConfig.debtResponseTopic
value.eventsTopic = mqConfig.eventsTopic

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

value.isAlerting = value.isDev || value.isProd

module.exports = value
