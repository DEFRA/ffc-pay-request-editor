const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendManualLedgerCheckEvent = async (paymentRequestId) => {
  const { correlationId } = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-quality-check-event',
    type: 'info',
    message: 'Manual ledger check confirmed ready to be reviewed.',
    data: { }
  }
  await raiseEvent(event)
}

module.exports = sendManualLedgerCheckEvent
