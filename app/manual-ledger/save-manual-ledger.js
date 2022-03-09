const db = require('../data')

const saveManualLedger = async (paymentRequestId, ledgerPaymentRequestId, transaction) => {
  return db.manualLedgerPaymentRequest.create({ paymentRequestId, ledgerPaymentRequestId }, { transaction })
}

module.exports = saveManualLedger
