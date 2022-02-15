const db = require('../data')

const getQualityChecksCount = async () => {
  return db.paymentRequest.count()
}

module.exports = getQualityChecksCount
