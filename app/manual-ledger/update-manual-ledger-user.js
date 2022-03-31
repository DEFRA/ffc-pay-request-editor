const db = require('../data')

const updateManualLedgerUser = async (paymentRequestId, user) => {
  return db.manualLedgerPaymentRequest.update({
    createdBy: user.username,
    createdById: user.userId
  }, {
    where: {
      paymentRequestId,
      active: true
    }
  })
}

module.exports = updateManualLedgerUser
