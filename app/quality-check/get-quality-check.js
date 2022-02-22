const db = require('../data')

const getQualityCheck = async (paymentRequestId, transaction) => {
  return db.qualityCheck.findAll({
    transaction,
    where: {
      paymentRequestId: paymentRequestId
    }
  })
}

module.exports = getQualityCheck
