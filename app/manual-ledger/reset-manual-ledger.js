const db = require('../database')
const { manualLedgerPaymentRequest, invoiceLine, paymentRequest } = db

const resetManualLedger = async (paymentRequestId) => {
  const transaction = await db.transaction()
  try {
    await cleanUpManualLedger(paymentRequestId, transaction)
    await activateOriginalManualLedger(paymentRequestId, transaction)
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

const activateOriginalManualLedger = (paymentRequestId, transaction) => {
  return manualLedgerPaymentRequest(transaction ?? undefined)
    .where({ paymentRequestId, original: true })
    .update({ active: true, createdById: null, createdBy: null })
}

const cleanUpManualLedger = async (paymentRequestId, transaction) => {
  const paymentRequestsToDelete = await manualLedgerPaymentRequest(transaction ?? undefined).where({
    active: true,
    original: false,
    paymentRequestId
  })
  const paymentRequestsIdsToDelete = paymentRequestsToDelete.map(x => x.ledgerPaymentRequestId)
  await manualLedgerPaymentRequest(transaction ?? undefined).where({ paymentRequestId, active: true, original: false }).del()
  await invoiceLine(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestsIdsToDelete).del()
  await paymentRequest(transaction ?? undefined).whereIn('paymentRequestId', paymentRequestsIdsToDelete).del()
}

module.exports = resetManualLedger
