const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')
const config = require('../config')
const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')

const sendEnrichRequestBlockedEvent = async (paymentRequest) => {
  if (config.useV1Events) {
    await sendV1EnrichRequestBlockedEvent(paymentRequest)
  }
  if (config.useV2Events) {
    await sendV2EnrichRequestBlockedEvent(paymentRequest)
  }
}

const sendV1EnrichRequestBlockedEvent = async (paymentRequest) => {
  const { paymentRequestId } = paymentRequest
  if (paymentRequestId) {
    const correlationId = await getCorrelationId(paymentRequestId) ?? ''
    const event = {
      id: correlationId || paymentRequestId,
      name: 'payment-request-blocked',
      type: 'blocked',
      message: 'Payment request does not have debt data to attach.',
      data: { paymentRequest }
    }
    await raiseEvent(event)
  }
}

const sendV2EnrichRequestBlockedEvent = async (paymentRequest) => {
  const event = {
    source: 'ffc-pay-request-editor',
    type: 'uk.gov.defra.ffc.pay.warning.payment.debt.missing',
    data: {
      message: 'Payment request does not have debt data to attach',
      ...paymentRequest
    }
  }
  const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendEnrichRequestBlockedEvent
