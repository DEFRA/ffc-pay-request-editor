const { EventPublisher } = require('ffc-pay-event-publisher')
const messageConfig = require('../config/mq-config')
const { SOURCE } = require('../constants/source')
const { PAYMENT_REQUEST_ENRICHED } = require('../constants/events')

const sendEnrichRequestEvent = async (paymentRequest, user) => {
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
