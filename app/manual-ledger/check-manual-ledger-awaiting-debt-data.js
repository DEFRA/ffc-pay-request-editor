const db = require('../data')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const isManualLedgerAwaitingDebtData = async (paymentRequestId) => {
  const inManualLedgerAwaitingDebtData = await db.qualityCheck.findOne({
    where: {
      paymentRequestId,
      status: AWAITING_ENRICHMENT
    }
  })
  return inManualLedgerAwaitingDebtData
}

module.exports = isManualLedgerAwaitingDebtData
