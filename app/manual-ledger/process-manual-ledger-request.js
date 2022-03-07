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
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      delete paymentRequest.paymentRequestId
      const savedPaymentRequest = await savePaymentRequest(paymentRequest)
      const paymentRequestId = savedPaymentRequest.paymentRequestId
      for (const paymentRequestDelta of manualLedgerRequest.paymentRequests) {
        paymentRequestDelta.paymentRequestId = paymentRequestId
        await saveManualLedger(paymentRequestDelta)
        await saveInvoiceLines(paymentRequestDelta.invoiceLines, paymentRequestId)
      }
      await updateQualityCheck(paymentRequestId)
      const scheduleId = manualLedgerRequest.scheduleId
      await createSchedule(scheduleId, paymentRequestId)

      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = processManualLedgerRequest
