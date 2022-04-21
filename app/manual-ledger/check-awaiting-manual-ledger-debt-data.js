const db = require('../data')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const checkAwaitingManualLedgerDebtData = async (paymentRequestId) => {
  return db.qualityCheck.findOne({
    where: {
      paymentRequestId,
      status: AWAITING_ENRICHMENT
    }
  })
}

module.exports = checkAwaitingManualLedgerDebtData
