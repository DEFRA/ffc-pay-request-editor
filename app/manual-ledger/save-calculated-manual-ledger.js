const db = require('../data')
const { savePaymentAndInvoiceLines } = require('../payment-request')
const saveManualLedger = require('./save-manual-ledger')

const saveCalculatedManualLedger = async (calculatedManualLedgers) => {
  const transaction = await db.sequelize.transaction()
  try {
    const paymentRequestId = calculatedManualLedgers.paymentRequestId
    const provisionalLedgerData = calculatedManualLedgers.provisionalLedgerData

    await updateManualLedger(paymentRequestId, transaction)

    for (const paymentRequest of provisionalLedgerData) {
      const ledgerPaymentRequest = paymentRequest.ledgerPaymentRequest
      const matchingPaymentRequest = await db.manualLedgerPaymentRequest.findOne({
        include: [{
          model: db.paymentRequest,
          as: 'ledgerPaymentRequest',
          where: {
            value: ledgerPaymentRequest.value,
            ledger: ledgerPaymentRequest.ledger,
            categoryId: 3
          }
        }],
        where: { paymentRequestId },
        transaction
      })
      if (matchingPaymentRequest) {
        await db.manualLedgerPaymentRequest.update({ active: true }, { where: { manualLedgerPaymentRequestId: matchingPaymentRequest.manualLedgerPaymentRequestId } }, { transaction })
      } else {
        const paymentRequestLedgerId = await savePaymentAndInvoiceLines(ledgerPaymentRequest, 3, transaction)
        await saveManualLedger(paymentRequestId, paymentRequestLedgerId, false, transaction)
      }
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

const updateManualLedger = async (paymentRequestId, transaction) => {
  return db.manualLedgerPaymentRequest.update({ active: false }, { where: { paymentRequestId } }, { transaction })
}

module.exports = saveCalculatedManualLedger
