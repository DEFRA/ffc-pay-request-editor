const createSplitInvoiceNumber = require('./create-split-invoice-number')
const ensureValueConsistency = require('./ensure-value-consistency')

const splitToLedger = (paymentRequest, targetValue, targetLedger) => {
  const originalValue = paymentRequest.value
  // const updatedValue = targetLedger === AP ? originalValue + targetValue : originalValue - targetValue

  paymentRequest.originalInvoiceNumber = paymentRequest.invoiceNumber
  paymentRequest.invoiceNumber = createSplitInvoiceNumber(paymentRequest.invoiceNumber, 'A')

  const splitPaymentRequest = copyPaymentRequest(paymentRequest, targetLedger)

  const splitApportionmentPercent = Math.abs(targetValue) / Math.abs(paymentRequest.value)
  const apportionmentPercent = 1 - splitApportionmentPercent

  calculateInvoiceLines(paymentRequest.invoiceLines, apportionmentPercent)
  calculateInvoiceLines(splitPaymentRequest.invoiceLines, splitApportionmentPercent)

  paymentRequest.value = originalValue - targetValue
  splitPaymentRequest.value = originalValue - paymentRequest.value

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
