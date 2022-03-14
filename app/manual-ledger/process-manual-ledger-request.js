const db = require('../data')
const getExistingPaymentRequest = require('../payment-request/get-existing-payment-request')
const savePaymentRequest = require('../payment-request/save-payment-request')
const saveManualLedger = require('./save-manual-ledger')
const updateQualityCheck = require('../inbound/quality-checks')
const createSchedule = require('./create-schedule')
const saveInvoiceLines = require('../inbound/invoice-lines')

const processManualLedgerRequest = async (manualLedgerRequest) => {
  const paymentRequest = manualLedgerRequest.paymentRequest
  const transaction = await db.sequelize.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, 2, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, 2)
      for (const paymentRequestProvisional of manualLedgerRequest.paymentRequests) {
        const paymentRequestLedgerId = await savePaymentAndInvoiceLines(paymentRequestProvisional, 3)
        await saveManualLedger(paymentRequestId, paymentRequestLedgerId, transaction)
      }
      await updateQualityCheck(paymentRequestId, transaction)
      const scheduleId = manualLedgerRequest.scheduleId
      await createSchedule(scheduleId, paymentRequestId, transaction)

      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

const savePaymentAndInvoiceLines = async (paymentRequest, categoryId, transaction) => {
  delete paymentRequest.paymentRequestId
  paymentRequest.categoryId = categoryId
  const savedPaymentRequest = await savePaymentRequest(paymentRequest, transaction)
  const paymentRequestId = savedPaymentRequest.paymentRequestId
  await saveInvoiceLines(paymentRequest.invoiceLines, paymentRequestId, transaction)
  return paymentRequestId
}

module.exports = processManualLedgerRequest
