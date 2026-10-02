const { manualLedgerPaymentRequest } = require('../database')

const removeManualLedgerPaymentRequest = async (paymentRequestIds, transaction) => {
  await manualLedgerPaymentRequest(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestIds).del()
}

module.exports = {
  removeManualLedgerPaymentRequest
}
