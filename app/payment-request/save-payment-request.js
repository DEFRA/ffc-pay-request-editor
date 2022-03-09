const db = require('../data')

const savePaymentRequest = async (paymentRequest, transaction) => {
  return db.paymentRequest.create({ ...paymentRequest, received: new Date() }, { transaction })
}

module.exports = savePaymentRequest
