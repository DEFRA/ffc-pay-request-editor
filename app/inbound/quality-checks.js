const db = require('../data')

const updateQualityCheck = async (paymentRequestId) => {
  await db.qualityCheck.create({ paymentRequestId, status: 'Not ready' })
}

module.exports = updateQualityCheck
