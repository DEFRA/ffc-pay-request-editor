const config = require('../config')
const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { PAYMENT_REQUEST_BLOCKED } = require('../constants/events')

const sendEnrichRequestBlockedEvent = async (paymentRequest) => {
  if (config.useV2Events) {
    await sendV2EnrichRequestBlockedEvent(paymentRequest)
  }
}

const sendV2EnrichRequestBlockedEvent = async (paymentRequest) => {
  const event = {
    source: SOURCE,
    type: PAYMENT_REQUEST_BLOCKED,
    data: {
      message: 'Payment request does not have debt data to attach',
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendEnrichRequestBlockedEvent
