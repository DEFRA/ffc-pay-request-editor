const db = require('../data')

const updateQualityCheck = async (paymentRequestId) => {
  await db.qualityCheck.create({ paymentRequestId, status: 'Pending' })
}

module.exports = updateQualityCheck
