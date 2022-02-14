const db = require('../data')
const saveInvoiceLines = require('./invoice-lines')
const updateQualityCheck = require('./quality-checks')

const savePaymentRequest = async (paymentRequest) => {
  return db.paymentRequest.create({ ...paymentRequest, received: new Date() })
}

const getExistingPaymentRequest = async (invoiceNumber, transaction) => {
  return db.paymentRequest.findOne({
    transaction,
    lock: true,
    skipLocked: true,
    where: {
      invoiceNumber
    }
  })
}

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

module.exports = { savePaymentRequest, getExistingPaymentRequest, processPaymentRequest }
