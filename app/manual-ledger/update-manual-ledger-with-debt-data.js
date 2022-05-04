const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory, getPaymentRequestByRequestId } = require('../payment-request')
const { checkDebts, attachDebtInformation, getDebtData, checkDebtsByEnrichment } = require('../debt')
const { PASSED, AWAITING_ENRICHMENT } = require('../quality-check/statuses')
const getManualLedgerRequestsDebt = require('../manual-ledger/get-manual-ledger-requests')
const { AR } = require('../processing/ledger/ledgers')
const { ENRICHMENT } = require('../payment-request/categories')
const updateManualLedgerWithDebtData = async (paymentRequestId) => {
  const manualLedgerRequest = await getManualLedgerRequestsDebt(paymentRequestId)
  if (!manualLedgerRequest) {
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  const isArLedger = manualLedgerRequest.find(x => x.ledgerPaymentRequest.ledger === AR && x.ledgerPaymentRequest.value !== 0)
  if (!isArLedger) {
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  const updatedDebtData = await getDebtData(paymentRequestId)

  if (updatedDebtData) {
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  const paymentRequest = await getPaymentRequestByRequestId(paymentRequestId)

  const { frn, agreementNumber, netValue } = paymentRequest

  const foundDebtData = await checkDebts(frn, agreementNumber, netValue)

  if (foundDebtData) {
    paymentRequest.value = paymentRequest.netValue
    await attachDebtInformation(paymentRequestId, paymentRequest)
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  const foundEnrichedDebtData = await checkDebtsByEnrichment(frn, agreementNumber, netValue)

  if (foundEnrichedDebtData) {
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  await updatePaymentRequestCategory(paymentRequestId, ENRICHMENT)
  await updateQualityChecksStatus(paymentRequestId, AWAITING_ENRICHMENT)
}
module.exports = updateManualLedgerWithDebtData
