const { convertValueToStringFormat } = require('../processing/conversion')
const splitToLedger = require('../processing/ledger/split-to-ledger')
const getManualLedger = require('./get-manual-ledger')

const calculateManualLedger = async (paymentRequestId, arValue, apValue) => {
  const manualLedgerData = await getManualLedger(paymentRequestId)
  if (validateValues(arValue, apValue, manualLedgerData.value)) {
    const copyManualLedgerData = JSON.parse(JSON.stringify(manualLedgerData))
    const targetLedger = manualLedgerData.ledger === 'AP' ? 'AR' : 'AP'
    const targetValue = targetLedger === 'AP' ? apValue : arValue
    const splitLedger = splitToLedger(copyManualLedgerData, targetValue, targetLedger)
    updateManualLegerChecks(manualLedgerData, splitLedger)
    return manualLedgerData
  }

  return {}
}

const updateManualLegerChecks = (manualLedgerData, splitLedger) => {
  manualLedgerData.manualLedgerChecks = []
  manualLedgerData.manualLedgerChecks = splitLedger.filter(x => x.value !== 0).map(ledger => {
    ledger.valueText = convertValueToStringFormat(ledger.value)
    ledger.invoiceLines.map(x => {
      x.valueText = convertValueToStringFormat(x.value)
      return x
    })
    return {
      ledgerPaymentRequest: ledger
    }
  })
}

const validateValues = (arValue, apValue, originalValue) => {
  const proposedValues = arValue + apValue
  return proposedValues === parseFloat(originalValue)
}

module.exports = calculateManualLedger
