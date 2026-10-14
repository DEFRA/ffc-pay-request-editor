const { qualityCheck } = require('../database')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const checkAwaitingManualLedgerDebtData = async (paymentRequestId) => {
  return (await qualityCheck().where({ paymentRequestId, status: AWAITING_ENRICHMENT }).first()) ?? null
}

module.exports = checkAwaitingManualLedgerDebtData
