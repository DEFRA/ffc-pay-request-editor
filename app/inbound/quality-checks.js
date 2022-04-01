const db = require('../data')
const { NOT_READY } = require('../quality-check/statuses')

const updateQualityCheck = async (paymentRequestId, transaction) => {
  await db.qualityCheck.create({ paymentRequestId, status: NOT_READY }, { transaction })
}

module.exports = updateQualityCheck
