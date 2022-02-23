const getSingleQualityCheck = require('./get-single-quality-check')
const saveQualityCheck = require('./save-quality-check')

const updateQualityCheckStatus = async (paymentRequestId, paymentRequest, transaction) => {
  const qualityCheckToUpdate = await getSingleQualityCheck(paymentRequestId, transaction)
  qualityCheckToUpdate.status = 'Pending'
  await saveQualityCheck(qualityCheckToUpdate, transaction)
}

module.exports = updateQualityCheckStatus
