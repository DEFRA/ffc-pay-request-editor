const db = require('../data')

const updateQualityCheck = async (paymentRequestId, transaction) => {
  await db.qualityCheck.create({ paymentRequestId, status: 'Not ready' }, { transaction })
}

module.exports = updateQualityCheck
