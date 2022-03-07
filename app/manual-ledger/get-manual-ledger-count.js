const db = require('../data')

const getManualLedgerCount = async () => {
  return db.manualLedgerChecks.count()
}

module.exports = getManualLedgerCount
