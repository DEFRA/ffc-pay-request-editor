const db = require('../data')

const getPaymentRequestCount = async () => {
  return db.paymentRequest.count()
}

module.exports = getPaymentRequestCount
