const { paymentRequest } = require('../database')

const updatePaymentRequestReleased = async (paymentRequestId) => {
  return paymentRequest().where({ paymentRequestId }).update({ released: new Date() })
}

module.exports = updatePaymentRequestReleased
