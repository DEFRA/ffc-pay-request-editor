const db = require('../data')

const isManualLedgerAwaitingDebtData = async (paymentRequestId) => {
  return await db.qualityCheck.findOne({
    where: {
      paymentRequestId,
      status: 'Awaiting Enrichment'
    }
  })
}

module.exports = isManualLedgerAwaitingDebtData
