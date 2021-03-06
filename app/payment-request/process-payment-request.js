const db = require('../data')
const getExistingPaymentRequest = require('./get-existing-payment-request')
const savePaymentRequest = require('./save-payment-request')
const saveInvoiceLines = require('../inbound/invoice-lines')
const updateQualityCheck = require('../inbound/quality-checks')
const { attachDebtInformationIfExists } = require('../debt')

const processPaymentRequest = async (paymentRequest) => {
  const transaction = await db.sequelize.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, paymentRequest.referenceId, 1, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${paymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      delete paymentRequest.paymentRequestId
      paymentRequest.categoryId = 1
      const savedPaymentRequest = await savePaymentRequest(paymentRequest)
      const paymentRequestId = savedPaymentRequest.paymentRequestId
      await saveInvoiceLines(paymentRequest.invoiceLines, paymentRequestId)
      await updateQualityCheck(paymentRequestId)
      await attachDebtInformationIfExists(paymentRequestId, paymentRequest, transaction)
      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = processPaymentRequest
