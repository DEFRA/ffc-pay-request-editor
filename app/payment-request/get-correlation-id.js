const db = require('../data')

const getCorrelationId = async (paymentRequestId) => {
  const correlationId = await db.paymentRequest.findOne({
    where: { paymentRequestId },
    attributes: ['correlationId'],
    raw: true
  })
  if (correlationId) {
    return correlationId
  }
  return {}
}

module.exports = getCorrelationId
