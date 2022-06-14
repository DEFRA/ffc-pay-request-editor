const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')
const { LEDGER_ENRICHMENT } = require('../payment-request/categories')

const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')

const getManualLedgerRequests = require('./get-manual-ledger-requests')
const checkForARLedger = require('./check-for-ar-ledger')

const updateManualLedgerWithDebtData = async (paymentRequestId, status) => {
  const manualLedgerRequest = await getManualLedgerRequests(paymentRequestId)
  status = await checkForARLedger(manualLedgerRequest, status)

  await updateStatus(paymentRequestId, status)
}

const updateStatus = async (paymentRequestId, status) => {
  if (status === AWAITING_ENRICHMENT) {
    await updatePaymentRequestCategory(paymentRequestId, LEDGER_ENRICHMENT)
  }

  await updateQualityChecksStatus(paymentRequestId, status)
}

module.exports = updateManualLedgerWithDebtData
