const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendManualLedgerReviewEvent = async (paymentRequestId, status) => {
  const { correlationId } = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-quality-review-event',
    type: 'info',
    message: 'Manual ledger check sucessfully reviewed.',
    data: { status }
  }
  await raiseEvent(event)
}

module.exports = sendManualLedgerReviewEvent