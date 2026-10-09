const { convertValueToStringFormat, convertToPounds, convertDebtIdToText } = require('../processing/conversion')
const toCurrencyString = require('./to-currency-string')

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

const addInvoiceLineFields = (invoiceLine) => ({
  ...invoiceLine,
  valueText: convertValueToStringFormat(invoiceLine.value)
})

const addPaymentRequestFields = (paymentRequest) => ({
  ...paymentRequest,
  valueText: convertValueToStringFormat(paymentRequest.value),
  daysWaiting: paymentRequest.received
    ? Math.round((Date.now() - paymentRequest.received) / MILLISECONDS_PER_DAY)
    : '',
  netValueText: convertValueToStringFormat(paymentRequest.netValue || paymentRequest.value),
  receivedFormatted: paymentRequest.received
    ? paymentRequest.received.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : ''
})

const addDebtDataFields = (debtData) => ({
  ...debtData,
  netValueText: toCurrencyString(convertToPounds(debtData.netValue)),
  debtTypeText: convertDebtIdToText(debtData.debtType)
})

module.exports = {
  addInvoiceLineFields,
  addPaymentRequestFields,
  addDebtDataFields
}
