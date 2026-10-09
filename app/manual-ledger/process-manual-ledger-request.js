const db = require('../database')
const saveManualLedger = require('./save-manual-ledger')
const updateQualityCheck = require('../inbound/quality-checks')
const { getExistingPaymentRequest, savePaymentAndInvoiceLines } = require('../payment-request')
const { LEDGER_CHECK, PROVISIONAL_LEDGER_CHECK } = require('../payment-request/categories')

const processManualLedgerRequest = async (manualLedgerRequest) => {
  const paymentRequest = manualLedgerRequest.paymentRequest
  const transaction = await db.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, paymentRequest.referenceId, LEDGER_CHECK, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${existingPaymentRequest.invoiceNumber}`)
      await transaction.rollback()
    } else {
      const paymentRequestId = await savePaymentAndInvoiceLines(paymentRequest, LEDGER_CHECK, transaction)
      for (const paymentRequestProvisional of manualLedgerRequest.paymentRequests) {
        const paymentRequestLedgerId = await savePaymentAndInvoiceLines(paymentRequestProvisional, PROVISIONAL_LEDGER_CHECK, transaction)
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
