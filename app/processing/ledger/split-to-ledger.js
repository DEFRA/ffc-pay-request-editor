const createSplitInvoiceNumber = require('./create-split-invoice-number')
const ensureValueConsistency = require('./ensure-value-consistency')
const { v4: uuidv4 } = require('uuid')

const splitToLedger = (paymentRequest, targetValue, targetLedger) => {
  const originalValue = paymentRequest.value

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
    invoiceNumber: createSplitInvoiceNumber(paymentRequest.originalInvoiceNumber, 'B'),
    referenceId: uuidv4()
  }
}

const calculateInvoiceLines = (invoiceLines, apportionmentPercent) => {
  invoiceLines.map(x => {
    x.value = x.value > 0 ? Math.ceil(x.value * apportionmentPercent) : Math.floor(x.value * apportionmentPercent)
    return x
  })
}

module.exports = splitToLedger
