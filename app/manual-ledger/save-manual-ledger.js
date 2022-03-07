const db = require('../data')

const saveManualLedger = async (paymentRequest) => {
  return db.manualLedgerChecks.create({ ...paymentRequest, received: new Date() })
}

module.exports = saveManualLedger
