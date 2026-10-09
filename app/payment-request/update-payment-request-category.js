const { paymentRequest } = require('../database')

const updatePaymentRequestCategory = async (paymentRequestId, categoryId) => {
  return paymentRequest().where({ paymentRequestId }).update({ categoryId })
}

module.exports = updatePaymentRequestCategory
