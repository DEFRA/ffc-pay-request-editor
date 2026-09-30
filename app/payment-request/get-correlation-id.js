const { paymentRequest } = require('../database')

const getCorrelationId = async (paymentRequestId) => {
  const request = await paymentRequest().select('correlationId').where({ paymentRequestId }).first()
  return request?.correlationId
}

module.exports = getCorrelationId
