const db = require('../data')

const updateQualityChecksStatus = async (paymentRequestId, newStatus, transaction) => {
  return db.qualityCheck.update({ status: newStatus, checkedDate: new Date() }, { where: { paymentRequestId: paymentRequestId } }, { transaction })
}

module.exports = updateQualityChecksStatus
