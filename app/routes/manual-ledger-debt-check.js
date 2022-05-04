const { getManualLedgerRequests } = require('../manual-ledger')
const { checkDebtsByEnrichment } = require('../debt')
const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')
const { AR } = require('../processing/ledger/ledgers')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')
const { LEDGER_ENRICHMENT } = require('../payment-request/categories')

const manualLedgerDebtChecks = async (paymentRequestId, status) => {
  const manualLedgerRequest = await getManualLedgerRequests(paymentRequestId)
  status = await checkForARLedger(manualLedgerRequest, status)

  await updateStatus(paymentRequestId, status)
}

const checkForARLedger = async (manualLedgerRequest, status) => {
  const arLedger = manualLedgerRequest
    .find(x => x.ledgerPaymentRequest.ledger === AR && x.ledgerPaymentRequest.value !== 0)

  if (arLedger) {
    const debtData = await checkForDebtData(arLedger)
    if (!debtData) {
      status = AWAITING_ENRICHMENT
    }
  }

  return status
}

const checkForDebtData = async (manualLedger) => {
  const { frn, agreementNumber, netValue } = manualLedger.ledgerPaymentRequest
  return checkDebtsByEnrichment(frn, agreementNumber, netValue)
}

const updateStatus = async (paymentRequestId, status) => {
  if (status === AWAITING_ENRICHMENT) {
    await updatePaymentRequestCategory(paymentRequestId, LEDGER_ENRICHMENT)
  }

  await updateQualityChecksStatus(paymentRequestId, status)
}

module.exports = manualLedgerDebtChecks
