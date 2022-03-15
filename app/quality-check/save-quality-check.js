const db = require('../data')

const saveQualityCheck = (qualityCheckToUpdate, transaction) => {
  const { status, paymentRequestId } = qualityCheckToUpdate
  return db.qualityCheck.update({
    status: status
  },
  {
    where: {
      paymentRequestId: paymentRequestId
    }
  },
  {
    transaction
  })
}

module.exports = saveQualityCheck
