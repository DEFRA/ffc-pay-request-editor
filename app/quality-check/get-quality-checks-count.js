const db = require('../data')

const getQualityChecksCount = async () => {
  return db.qualityCheck.count()
}

module.exports = getQualityChecksCount
