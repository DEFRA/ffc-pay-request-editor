const db = require('../data')
const { savePaymentAndInvoiceLines } = require('../payment-request')
const saveManualLedger = require('./save-manual-ledger')

const saveCalculatedManualLedger = async (calculatedManualLedgers) => {
  const transaction = await db.sequelize.transaction()
  try {
    const paymentRequestId = calculatedManualLedgers.paymentRequestId
    const provisionalLedgerData = calculatedManualLedgers.provisionalLedgerData

    updateManualLedger(paymentRequestId, transaction)

    for (const paymentRequest of provisionalLedgerData) {
      const ledgerPaymentRequest = paymentRequest.ledgerPaymentRequest
      const paymentRequestLedgerId = await savePaymentAndInvoiceLines(ledgerPaymentRequest, 3, transaction)
      await saveManualLedger(paymentRequestId, paymentRequestLedgerId, false, transaction)
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

const updateManualLedger = (paymentRequestId, transaction) => {
  return db.manualLedgerPaymentRequest.update({ active: false }, { where: { paymentRequestId } }, { transaction })
}

module.exports = saveCalculatedManualLedger
