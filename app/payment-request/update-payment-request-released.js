const db = require('../data')

const updatePaymentRequestReleased = async (paymentRequestId) => {
  return db.paymentRequest.update({ released: new Date() }, { where: { paymentRequestId } })
}

module.exports = updatePaymentRequestReleased
