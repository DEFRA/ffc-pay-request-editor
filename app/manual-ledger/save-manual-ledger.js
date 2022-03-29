const db = require('../data')

const saveManualLedger = async (paymentRequestId, ledgerPaymentRequestId, original, user, transaction) => {
  return db.manualLedgerPaymentRequest.create(
    {
      paymentRequestId,
      ledgerPaymentRequestId,
      active: true,
      original,
      createdDate: new Date(),
      createdBy: user.username,
      createdById: user.userId
    },
    { transaction })
}

module.exports = saveManualLedger
