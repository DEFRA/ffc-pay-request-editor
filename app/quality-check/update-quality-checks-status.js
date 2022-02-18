const db = require('../data')

const updateQualityChecksStatus = async (paymentRequestId, newStatus) => {
  return db.qualityCheck.update({ status: newStatus }, { where: { paymentRequestId: paymentRequestId } })
}

module.exports = updateQualityChecksStatus
