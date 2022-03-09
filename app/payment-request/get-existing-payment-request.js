const db = require('../data')

const getExistingPaymentRequest = async (invoiceNumber, categoryId, transaction) => {
  return db.paymentRequest.findOne({
    transaction,
    lock: true,
    skipLocked: true,
    where: {
      invoiceNumber,
      categoryId
    }
  })
}

module.exports = getExistingPaymentRequest
