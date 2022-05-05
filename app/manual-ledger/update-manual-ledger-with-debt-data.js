const getManualLedgerRequests = require('./get-manual-ledger-requests')
const { checkDebtsByEnrichment, saveDebtData } = require('../debt')
const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')
const { AR } = require('../processing/ledger/ledgers')
const { AWAITING_ENRICHMENT } = require('../quality-check/statuses')
const { LEDGER_ENRICHMENT } = require('../payment-request/categories')

const updateManualLedgerWithDebtData = async (paymentRequestId, status) => {
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

    await attachDebtInformation(debtData, arLedger)
  }

  return status
}

const attachDebtInformation = async (debtData, arLedger) => {
  if (debtData) {
    checkIfCapture(debtData, arLedger)
    debtData.attachedDate = new Date().toISOString()
    await saveDebtData(debtData)
  }
}

const checkIfCapture = (debtData, arLedger) => {
  if (!debtData.paymentRequestId) debtData.paymentRequestId = arLedger.paymentRequestId
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

module.exports = updateManualLedgerWithDebtData
