const { qualityCheck } = require('../database')
const { NOT_READY } = require('../quality-check/statuses')

const updateQualityCheck = async (paymentRequestId, transaction) => {
  await qualityCheck(transaction ?? undefined).insert({ paymentRequestId, status: NOT_READY })
}

module.exports = updateQualityCheck
