const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendEnrichRequestBlockedEvent = async (paymentRequest) => {
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

module.exports = sendEnrichRequestBlockedEvent
