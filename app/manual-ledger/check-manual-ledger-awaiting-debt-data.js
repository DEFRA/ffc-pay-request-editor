const db = require('../data')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const isManualLedgerAwaitingDebtData = async (paymentRequestId) => {
  return await db.qualityCheck.findOne({
    where: {
      paymentRequestId,
      status: AWAITING_ENRICHMENT
    }
  })
}

module.exports = isManualLedgerAwaitingDebtData
