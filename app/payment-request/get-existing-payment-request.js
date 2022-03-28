const db = require('../data')

const getExistingPaymentRequest = async (invoiceNumber, referenceId, categoryId, transaction) => {
  const where = referenceId ? { referenceId, categoryId } : { invoiceNumber, categoryId }
  return db.paymentRequest.findOne({
    transaction,
    lock: true,
    where
  })
}

module.exports = getExistingPaymentRequest
