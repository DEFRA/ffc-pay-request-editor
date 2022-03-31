const db = require('../data')

const resetManualLedger = async (paymentRequestId) => {
  const transaction = await db.sequelize.transaction()
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
  return db.manualLedgerPaymentRequest.update({ active: true, createdById: null, createdBy: null }, { where: { paymentRequestId, original: true } }, { transaction })
}

const cleanUpManualLedger = (paymentRequestId, transaction) => {
  return db.manualLedgerPaymentRequest.destroy({ where: { paymentRequestId, active: true, original: false } }, { transaction })
}

module.exports = resetManualLedger
