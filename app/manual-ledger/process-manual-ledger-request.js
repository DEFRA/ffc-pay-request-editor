const db = require('../data')
const saveManualLedger = require('./save-manual-ledger')
const updateQualityCheck = require('../inbound/quality-checks')
const { getExistingPaymentRequest, savePaymentAndInvoiceLines } = require('../payment-request')

const processManualLedgerRequest = async (manualLedgerRequest) => {
  const paymentRequest = manualLedgerRequest.paymentRequest
  const transaction = await db.sequelize.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, 2, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, 2, transaction)
      for (const paymentRequestProvisional of manualLedgerRequest.paymentRequests) {
        const paymentRequestLedgerId = await savePaymentAndInvoiceLines(paymentRequestProvisional, 3, transaction)
        await saveManualLedger(paymentRequestId, paymentRequestLedgerId, true, transaction)
      }
      await updateQualityCheck(paymentRequestId, transaction)
      await transaction.commit()
    }
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = processManualLedgerRequest
