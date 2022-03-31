const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendEnrichRequestEvent = async (paymentRequest) => {
  const { paymentRequestId } = paymentRequest
  const { correlationId } = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-enrich-request-event',
    type: 'info',
    message: 'Debt data succesfully enriched.',
    data: { paymentRequest }
  }
  await raiseEvent(event)
}

module.exports = sendEnrichRequestEvent
