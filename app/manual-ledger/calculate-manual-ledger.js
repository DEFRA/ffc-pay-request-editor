const { convertToPounds } = require('../processing/conversion')
const splitToLedger = require('../processing/ledger/split-to-ledger')
const getManualLedger = require('./get-manual-ledger')

const calculateManualLedger = async (paymentRequestId, arValue, apValue) => {
  const manualLedgerData = await getManualLedger(paymentRequestId)
  if (validateValues(arValue, apValue, manualLedgerData.value)) {
    const copyManualLedgerData = JSON.parse(JSON.stringify(manualLedgerData))
    const targetLedger = manualLedgerData.ledger === 'AP' ? 'AR' : 'AP'
    const targetValue = targetLedger === 'AP' ? apValue : arValue
    const splitLedger = await splitToLedger(copyManualLedgerData, targetValue, targetLedger)
    updateManualLegerChecks(manualLedgerData, splitLedger)
    return manualLedgerData
  }

  return {}
}

const updateManualLegerChecks = (manualLedgerData, splitLedger) => {
  manualLedgerData.manualLedgerChecks = []
  manualLedgerData.manualLedgerChecks = splitLedger.map(ledger => {
    ledger.valueDecimal = convertToPounds(ledger.value)
    ledger.invoiceLines.map(x => {
      x.valueDecimal = convertToPounds(x.value)
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
