const { convertToPounds } = require('../../currency-convert')
const splitToLedger = require('../../processing/ledger/split-to-ledger')
const { getManualLedger } = require('../../manual-ledger')
const { AP, AR } = require('../../processing/ledger/ledgers')

const calculate = async (paymentRequestId, arValue) => {
  const manualLedgerData = await getManualLedger(paymentRequestId)
  const copyManualLedgerData = JSON.parse(JSON.stringify(manualLedgerData))
  const ledger = manualLedgerData.ledger === AP ? AR : AP
  const splitLedger = await splitToLedger(copyManualLedgerData, arValue, ledger)
  manualLedgerData.manualLedgerChecks = []
  manualLedgerData.manualLedgerChecks = splitLedger.map(x => {
    x.valueDecimal = convertToPounds(x.value)
    x.invoiceLines.map(l => {
      l.valueDecimal = convertToPounds(l.value)
      return l
    })
    return {
      ledgerPaymentRequest: x
    }
  })

  return manualLedgerData
}

module.exports = calculate
