const Joi = require('joi')
const { DefaultAzureCredential } = require('@azure/identity')
const mqConfig = require('./mq-config')

// Define config schema
const schema = Joi.object({
  serviceName: Joi.string().default('Request Editor'),
  port: Joi.number().default(3001),
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  cacheName: Joi.string(),
  redisHost: Joi.string(),
  redisPort: Joi.number().default(6379),
  redisPassword: Joi.string().default(''),
  redisPartition: Joi.string().default('ffc-pay-request-editor'),
  cookiePassword: Joi.string().required(),
  sessionTimeoutMinutes: Joi.number().default(30),
  staticCacheTimeoutMillis: Joi.number().default(7 * 24 * 60 * 60 * 1000), // 1 day
  publishPollingInterval: Joi.number().default(10000), // 1 minute
  database: Joi.object({
    database: Joi.string(),
    dialect: Joi.string().default('postgres'),
    hooks: Joi.object({
      beforeConnect: Joi.function()
    }),
    host: Joi.string(),
    password: Joi.string(),
    port: Joi.number().default(5432),
    logging: Joi.boolean().default(false),
    retry: Joi.object({
      backoffBase: Joi.number().default(500),
      backoffExponent: Joi.number().default(1.1),
      match: Joi.array().default([/SequelizeConnectionError/]),
      max: Joi.number().default(10),
      name: Joi.string().default('connection'),
      timeout: Joi.number().default(60000)
    }),
    schema: Joi.string().default('public'),
    username: Joi.string()
  })
})

// Build config
const config = {
  serviceName: process.env.SERVICE_NAME,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  cacheName: 'redisCache',
  redisPartition: process.env.REDIS_PARTITION,
  redisHost: process.env.REDIS_HOSTNAME,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  cookiePassword: process.env.COOKIE_PASSWORD,
  sessionTimeoutMinutes: process.env.SESSION_TIMEOUT_IN_MINUTES,
  staticCacheTimeoutMillis: process.env.STATIC_CACHE_TIMEOUT_IN_MILLIS,
  publishPollingInterval: process.env.PUBLISH_POLLING_INTERVAL,
  database: {
    database: process.env.POSTGRES_DB,
    dialect: 'postgres',
    hooks: {
      beforeConnect: async (cfg) => {
        if (process.env.NODE_ENV === 'production') {
          const credential = new DefaultAzureCredential()
          const accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net')
          cfg.password = accessToken.token
        }
      }
    },
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT || 5432,
    logging: process.env.POSTGRES_LOGGING || false,
    retry: {
      backoffBase: 500,
      backoffExponent: 1.1,
      match: [/SequelizeConnectionError/],
      max: 10,
      name: 'connection',
      timeout: 60000
    },
    schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
    username: process.env.POSTGRES_USERNAME
  }
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

value.debtSubscription = mqConfig.debtSubscription
value.manualLedgerSubscription = mqConfig.manualLedgerSubscription
value.qcTopic = mqConfig.qcTopic
value.debtResponseTopic = mqConfig.debtResponseTopic

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

value.catboxOptions = {
  host: value.redisHost,
  port: value.redisPort,
  password: value.redisPassword,
  tls: value.isProd ? {} : undefined,
  partition: value.redisPartition
}

module.exports = value
