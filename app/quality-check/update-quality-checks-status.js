const { qualityCheck } = require('../database')

const updateQualityChecksStatus = async (paymentRequestId, newStatus, transaction) => {
  return qualityCheck(transaction ?? undefined).where({ paymentRequestId }).update({ status: newStatus, checkedDate: new Date() })
}

module.exports = updateQualityChecksStatus
