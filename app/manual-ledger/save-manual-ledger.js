const db = require('../data')

const saveManualLedger = async (paymentRequestId, ledgerPaymentRequestId, original, transaction) => {
  return db.manualLedgerPaymentRequest.create(
    {
      paymentRequestId,
      ledgerPaymentRequestId,
      active: true,
      original,
      createdDate: new Date(),
      createdBy: undefined
    },
    { transaction })
}

module.exports = saveManualLedger
