const { convertToPounds } = require('../currency-convert')
const splitToLedger = require('../processing/ledger/split-to-ledger')
const getManualLedger = require('./get-manual-ledger')

const calculateManualLedger = async (paymentRequestId, arValue) => {
  const manualLedgerData = await getManualLedger(paymentRequestId)
  const copyManualLedgerData = JSON.parse(JSON.stringify(manualLedgerData))
  const ledger = manualLedgerData.ledger === 'AP' ? 'AR' : 'AP'
  const splitLedger = await splitToLedger(copyManualLedgerData, arValue, ledger)
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

module.exports = calculateManualLedger
