const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendEnrichRequestBlockedEvent = async (paymentRequest) => {
  const { paymentRequestId } = paymentRequest
  const correlationId = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-blocked',
    type: 'blocked',
    message: 'Payment request does not have debt data to attach.',
    data: { paymentRequest }
  }
  await raiseEvent(event)
}

module.exports = sendEnrichRequestBlockedEvent
