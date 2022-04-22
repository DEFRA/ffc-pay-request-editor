const db = require('../data')

const updatePaymentRequestCategory = async (paymentRequestId, categoryId) => {
  return db.paymentRequest.update({ categoryId }, { where: { paymentRequestId } })
}

module.exports = updatePaymentRequestCategory
