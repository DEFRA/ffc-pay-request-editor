const db = require('../data')

const savePaymentRequest = async (paymentRequest) => {
  return db.paymentRequest.create({ ...paymentRequest, received: new Date() })
}

module.exports = savePaymentRequest
