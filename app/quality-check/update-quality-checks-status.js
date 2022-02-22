const db = require('../data')

const updateQualityChecksStatus = async (paymentRequestId, newStatus) => {
  return db.qualityCheck.update({ status: newStatus, checkedDate: new Date() }, { where: { paymentRequestId: paymentRequestId } })
}

module.exports = updateQualityChecksStatus
