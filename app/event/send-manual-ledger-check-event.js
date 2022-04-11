const raiseEvent = require('./raise-event')
const getCorrelationId = require('../payment-request/get-correlation-id')

const sendManualLedgerCheckEvent = async (paymentRequestId, user, provisionalLedgerData) => {
  const correlationId = await getCorrelationId(paymentRequestId)
  const event = {
    id: correlationId,
    name: 'payment-request-ledger-assignment-reviewed',
    type: 'info',
    message: 'Payment request ledger assignment reviewed',
    data: { provisionalLedgerData, user }
  }
  await raiseEvent(event)
}

module.exports = sendManualLedgerCheckEvent
