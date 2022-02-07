const db = require('./data')
const getExistingPaymentRequest = require('./get-existing-payment-request')
const savePaymentRequest = require('./save-payment-request')
const saveInvoiceLines = require('./save-invoice-lines')
const updateQualityCheck = require('./update-quality-check')

const processPaymentRequest = async (paymentRequest) => {
  console.log(`[${new Date()}]: Processing data`)
  const transaction = await db.sequelize.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, transaction)
    if (existingPaymentRequest) {
      console.info(`[${new Date()}]: Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      delete paymentRequest.paymentRequestId
      const savedPaymentRequest = await savePaymentRequest(paymentRequest)
      const paymentRequestId = savedPaymentRequest.paymentRequestId

      await saveInvoiceLines(paymentRequest.invoiceLines, paymentRequestId)
      await updateQualityCheck(paymentRequestId)
      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = processPaymentRequest
