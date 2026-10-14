const { manualLedgerPaymentRequest } = require('../database')

const saveManualLedger = async (paymentRequestId, ledgerPaymentRequestId, original, transaction) => {
  return manualLedgerPaymentRequest(transaction ?? undefined).insert({
    paymentRequestId,
    ledgerPaymentRequestId,
    active: true,
    original,
    createdDate: new Date()
  })
}

module.exports = saveManualLedger
