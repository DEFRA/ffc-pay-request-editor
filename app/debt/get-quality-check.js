const db = require('../data')

const getQualityCheck = async (paymentRequestId, transaction) => {
  return db.qualityCheck.findAll({
    transaction,
    lock: true,
    where: {
      paymentRequestId: paymentRequestId
    }
  })
}

module.exports = getQualityCheck
