const { manualLedgerPaymentRequest } = require('../database')
const getPaymentRequestsWithLines = require('../payment-request/get-payment-requests-with-lines')

const getManualLedgerRequests = async (paymentRequestId) => {
  const manualLedgerRequests = await manualLedgerPaymentRequest()
    .where({ paymentRequestId, active: true })
    .orderBy('manualLedgerPaymentRequestId', 'asc')

  const ledgerPaymentRequests = await getPaymentRequestsWithLines(
    manualLedgerRequests.map(x => x.ledgerPaymentRequestId),
    { includeSchemes: true }
  )

  return manualLedgerRequests.map(x => ({
    ...x,
    ledgerPaymentRequest: ledgerPaymentRequests.find(y => y.paymentRequestId === x.ledgerPaymentRequestId) ?? null
  }))
}

module.exports = getManualLedgerRequests
