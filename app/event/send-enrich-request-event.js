const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')
const config = require('../config')
const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { PAYMENT_REQUEST_ENRICHED } = require('../constants/events')

const sendEnrichRequestEvent = async (paymentRequest, user) => {
  if (config.useV1Events) {
    await sendV1EnrichRequestEvent(paymentRequest, user)
  }
  if (config.useV2Events) {
    await sendV2EnrichRequestEvent(paymentRequest, user)
  }
}

const sendV1EnrichRequestEvent = async (paymentRequest, user) => {
  const { paymentRequestId } = paymentRequest
  const correlationId = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-enriched',
    type: 'info',
    message: 'Debt data attached to payment request.',
    data: { paymentRequest, user }
  }
  await raiseEvent(event)
}

const sendV2EnrichRequestEvent = async (paymentRequest, user) => {
  const event = {
    source: SOURCE,
    type: PAYMENT_REQUEST_ENRICHED,
    data: {
      attachedBy: user,
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendEnrichRequestEvent
