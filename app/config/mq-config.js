const Joi = require('joi')

const mqSchema = Joi.object({
  messageQueue: {
    host: Joi.string().required(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object()
  },
  debtSubscription: Joi.object({
    topic: Joi.string(),
    address: Joi.string(),
    type: Joi.string().default('subscription')
  }),
  qcTopic: Joi.object({
    address: Joi.string()
  }),
  manualLedgerSubscription: Joi.object({
    topic: Joi.string(),
    address: Joi.string(),
    type: Joi.string().default('subscription')
  })
})

const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === 'production',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined
  },
  debtSubscription: {
    topic: process.env.DEBT_TOPIC_ADDRESS,
    address: process.env.DEBT_SUBSCRIPTION_ADDRESS,
    type: 'subscription'
  },
  qcTopic: {
    address: process.env.QC_TOPIC_ADDRESS
  },
  manualLedgerSubscription: {
    topic: process.env.MANUALLEDGER_TOPIC_ADDRESS,
    address: process.env.MANUALLEDGER_SUBSCRIPTION_ADDRESS,
    type: 'subscription'
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const debtSubscription = { ...mqResult.value.messageQueue, ...mqResult.value.debtSubscription }
const manualLedgerSubscription = { ...mqResult.value.messageQueue, ...mqResult.value.manualLedgerSubscription }
const qcTopic = { ...mqResult.value.messageQueue, ...mqResult.value.qcTopic }

module.exports = {
  debtSubscription,
  manualLedgerSubscription,
  qcTopic
}
