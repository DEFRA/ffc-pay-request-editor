const db = require('../data')

const removeManualLedgerPaymentRequest = async (paymentRequestIds, transaction) => {
  await db.manualLedgerPaymentRequest.destroy({
    where: {
      paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
    },
    transaction
  })
}

module.exports = {
  removeManualLedgerPaymentRequest
}
