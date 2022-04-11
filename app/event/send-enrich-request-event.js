const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendEnrichRequestEvent = async (paymentRequest, user) => {
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

module.exports = sendEnrichRequestEvent
