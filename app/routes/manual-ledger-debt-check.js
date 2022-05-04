const getManualLedgerRequestsDebt = require('../manual-ledger/get-manual-ledger-requests')
const { checkDebtsByEnrichment } = require('../debt')
const { AR, AP } = require('../processing/ledger/ledgers')

const manualLedgerDebtChecks = async (paymentRequestId, status) => {
  const manualLedgerRequest = await getManualLedgerRequestsDebt(paymentRequestId)
  await checkAccountLedger(manualLedgerRequest, AR)
  await checkAccountLedger(manualLedgerRequest, AP)
  console.log(`Updating manual ledger debt checks for paymentRequestId: ${paymentRequestId}`)
}

const checkAccountLedger = async (manualLedgerRequest, ledgerType) => {
  const ledger = manualLedgerRequest.find(x => x.ledgerPaymentRequest.ledger === ledgerType && x.ledgerPaymentRequest.value !== 0)

  if (ledger) {
    const debtData = getDebtData(ledger)
    if (debtData) {
      await attachDebtInformation(ledger, debtData)
    }
  }
}

const getDebtData = async (manualLedgerRequest) => {
  const { frn, agreementNumber, netValue, ledger } = manualLedgerRequest.ledgerPaymentRequest
  return checkDebtsByEnrichment(frn, agreementNumber, netValue)
}

const attachDebtInformation = async (manualLedgerRequest, debtData) => {
}

module.exports = manualLedgerDebtChecks
