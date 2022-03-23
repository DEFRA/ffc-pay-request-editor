const { convertToPounds } = require('../../currency-convert')
const splitToLedger = require('../../processing/ledger/split-to-ledger')
const { getManualLedger } = require('../../manual-ledger')

const calculate = async (paymentRequestId, arValue) => {
  const manualLedgerData = await getManualLedger(paymentRequestId)
  const copyManualLedgerData = JSON.parse(JSON.stringify(manualLedgerData))
  const provisionalLedger = manualLedgerData.ledger === 'AP' ? 'AR' : 'AP'
  const splitLedger = splitToLedger(copyManualLedgerData, arValue, provisionalLedger)
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

  return manualLedgerData
}

module.exports = calculate
