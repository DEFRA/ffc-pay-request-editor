const db = require('../data')
const getExistingPaymentRequest = require('./get-existing-payment-request')
const savePaymentRequest = require('./save-payment-request')
const saveInvoiceLines = require('../inbound/invoice-lines')
const updateQualityCheck = require('../inbound/quality-checks')
const { attachDebtInformation, getQualityCheck } = require('../debt')

const processPaymentRequest = async (paymentRequest) => {
  console.log('Processing data')
  const transaction = await db.sequelize.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      delete paymentRequest.paymentRequestId
      const savedPaymentRequest = await savePaymentRequest(paymentRequest)
      const paymentRequestId = savedPaymentRequest.paymentRequestId
      await attachDebtInformation(paymentRequestId, paymentRequest, transaction)
      await saveInvoiceLines(paymentRequest.invoiceLines, paymentRequestId)
      await updateQualityCheck(paymentRequestId)
      const updatedQualityCheck = await getQualityCheck(paymentRequestId, transaction)
      console.log(updatedQualityCheck)
      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = processPaymentRequest
