const Joi = require('joi')
const { DefaultAzureCredential } = require('@azure/identity')

// Define config schema
const schema = Joi.object({
  serviceName: Joi.string().default('Request Editor'),
  port: Joi.number().default(3001),
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  staticCacheTimeoutMillis: Joi.number().default(7 * 24 * 60 * 60 * 1000), // 1 day
  message: Joi.object({
    connection: Joi.object({
      host: Joi.string(),
      useCredentialChain: Joi.bool().default(false),
      appInsights: Joi.object(),
      username: Joi.string(),
      password: Joi.string()
    }),
    debtSubscription: Joi.object({
      topic: Joi.string(),
      address: Joi.string(),
      type: Joi.string().default('subscription')
    }),
    qcTopic: Joi.object({
      address: Joi.string()
    })
  }),
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
  staticCacheTimeoutMillis: process.env.STATIC_CACHE_TIMEOUT_IN_MILLIS,
  message: {
    connection: {
      host: process.env.MESSAGE_QUEUE_HOST,
      useCredentialChain: process.env.NODE_ENV === 'production',
      appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined,
      username: process.env.MESSAGE_QUEUE_USER,
      password: process.env.MESSAGE_QUEUE_PASSWORD
    },
    debtSubscription: {
      topic: process.env.DEBT_TOPIC_ADDRESS,
      address: process.env.DEBT_SUBSCRIPTION_ADDRESS,
      type: 'subscription'
    },
    qcTopic: {
      address: process.env.QC_TOPIC_ADDRESS
    }
  },
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

value.debtSubscription = { ...value.message.connection, ...value.message.debtSubscription }
value.qcTopic = { ...value.message.connection, ...value.message.qcTopic }

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

module.exports = value
