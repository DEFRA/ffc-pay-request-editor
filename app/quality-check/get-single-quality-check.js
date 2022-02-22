const db = require('../data')

const getSingleQualityCheck = (paymentRequestId, transaction) => {
  return db.qualityCheck.findOne({
    transaction,
    where: {
      paymentRequestId: paymentRequestId
    }
  })
}

module.exports = getSingleQualityCheck
