const db = require('../data')

const removeManualLedgerPaymentRequest = async (paymentRequestIds, transaction) => {
  await db.manualLedgerPaymentRequest.destroy({
    where: { paymentRequestId: paymentRequestIds },
    transaction
  })
}

module.exports = {
  removeManualLedgerPaymentRequest
}
