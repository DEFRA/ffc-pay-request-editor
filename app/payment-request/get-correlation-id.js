const db = require('../data')

const getCorrelationId = async (paymentRequestId) => {
  const paymentRequest = await db.paymentRequest.findOne({
    where: { paymentRequestId },
    attributes: ['correlationId'],
    raw: true
  })
  return paymentRequest?.correlationId
}

module.exports = getCorrelationId
