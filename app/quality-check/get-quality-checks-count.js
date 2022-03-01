const db = require('../data')

const getQualityChecksCount = async () => {
  return db.qualityCheck.count({ where: { status: 'Pending' } })
}

module.exports = getQualityChecksCount
