const { manualLedgerPaymentRequest } = require('../database')

const updateManualLedgerUser = async (paymentRequestId, user) => {
  return manualLedgerPaymentRequest().where({ paymentRequestId, active: true }).update({
    createdBy: user.username,
    createdById: user.userId
  })
}

module.exports = updateManualLedgerUser
