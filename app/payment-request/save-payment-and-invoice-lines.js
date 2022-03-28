const savePaymentRequest = require('./save-payment-request')
const saveInvoiceLines = require('../inbound/invoice-lines')

const savePaymentAndInvoiceLines = async (paymentRequest, categoryId, transaction) => {
  delete paymentRequest.paymentRequestId
  paymentRequest.categoryId = categoryId
  const savedPaymentRequest = await savePaymentRequest(paymentRequest, transaction)
  const paymentRequestId = savedPaymentRequest.paymentRequestId
  await saveInvoiceLines(paymentRequest.invoiceLines, paymentRequestId, transaction)
  return paymentRequestId
}

module.exports = savePaymentAndInvoiceLines
