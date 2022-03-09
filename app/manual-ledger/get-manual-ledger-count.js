const db = require('../data')

const getManualLedgerCount = async () => {
  return db.paymentRequest.count({ where: { categoryId: 2 } })
}

module.exports = getManualLedgerCount
