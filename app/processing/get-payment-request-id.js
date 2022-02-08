const db = require('../data')

const getPaymentRequestId = async (frn, schemeId, transaction) => {
  const paymentRequest = await db.paymentRequests.findOne({ where: { frn, schemeId }, transaction })
  return paymentRequest?.paymentRequestId
}

module.exports = getPaymentRequestId
