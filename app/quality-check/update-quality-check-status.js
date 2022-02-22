const getSingleQualityCheck = require('./get-single-quality-check')

const updateQualityCheckStatus = async (paymentRequestId, paymentRequest, transaction) => {
  const qualityCheckToUpdate = await getSingleQualityCheck(paymentRequestId, transaction)
  console.log(qualityCheckToUpdate)
  qualityCheckToUpdate.status = 'pending'
}

module.exports = updateQualityCheckStatus

// update the status in quality check table
// get the entry from the db
// update the relevant field
// save the data

// const updatedQualityCheck = await getQualityCheck(paymentRequestId, transaction)
// console.log(updatedQualityCheck)
