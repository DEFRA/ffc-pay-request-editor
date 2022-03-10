const db = require('../data')

const saveManualLedger = async (paymentRequestId, ledgerPaymentRequestId, transaction) => {
  return db.manualLedgerPaymentRequest.create(
    {
      paymentRequestId,
      ledgerPaymentRequestId,
      status: 'Active',
      createdDate: new Date(),
      createdBy: undefined
    },
    { transaction })
}

module.exports = saveManualLedger
