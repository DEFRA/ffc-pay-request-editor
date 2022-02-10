const qualityCheckData = require('./routes/quality-check-data')
const db = require('./data')

const getQualityChecks = async () => {
  const qualityChecks = await db.qualityCheck.findAll()
  console.log(qualityChecks)
  return qualityCheckData
}

module.exports = {
  getQualityChecks
}
