const createSplitInvoiceNumber = require('./create-split-invoice-number')
const { AP } = require('./ledgers')
const ensureValueConsistency = require('./ensure-value-consistency')

const splitToLedger = (paymentRequest, unsettledValue, unsettledLedger) => {
  const originalValue = paymentRequest.value
  const updatedValue = unsettledLedger === AP ? originalValue + unsettledValue : originalValue - unsettledValue

  paymentRequest.originalInvoiceNumber = paymentRequest.invoiceNumber
  paymentRequest.invoiceNumber = createSplitInvoiceNumber(paymentRequest.invoiceNumber, 'A')

  const splitPaymentRequest = copyPaymentRequest(paymentRequest, unsettledLedger)

  const splitApportionmentPercent = Math.abs(unsettledValue) / Math.abs(paymentRequest.value)
  const apportionmentPercent = 1 - splitApportionmentPercent

  calculateInvoiceLines(paymentRequest.invoiceLines, apportionmentPercent)
  calculateInvoiceLines(splitPaymentRequest.invoiceLines, splitApportionmentPercent)

  paymentRequest.value = updatedValue
  splitPaymentRequest.value = originalValue - updatedValue

  ensureValueConsistency(paymentRequest)
  ensureValueConsistency(splitPaymentRequest)

  return [paymentRequest, splitPaymentRequest]
}

const copyPaymentRequest = (paymentRequest, ledger) => {
  const copiedPaymentRequest = JSON.parse(JSON.stringify(paymentRequest))
  return {
    ...copiedPaymentRequest,
    ledger,
    invoiceNumber: createSplitInvoiceNumber(paymentRequest.originalInvoiceNumber, 'B')
  }
}

const calculateInvoiceLines = (invoiceLines, apportionmentPercent) => {
  invoiceLines.map(x => {
    x.value = x.value > 0 ? Math.ceil(x.value * apportionmentPercent) : Math.floor(x.value * apportionmentPercent)
    return x
  })
}

module.exports = splitToLedger
