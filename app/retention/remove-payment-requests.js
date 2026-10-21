const { paymentRequest } = require('../database')

const removePaymentRequests = async (paymentRequestIds, transaction) => {
  await paymentRequest(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestIds).del()
}

module.exports = {
  removePaymentRequests
}
