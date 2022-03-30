const db = require('../data')
const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')
const { checkDebts, attachDebtInformation } = require('../debt')

const updateManualLedgerWithDebtData = async (paymentRequestId) => {
  const updatedDebtData = await db.debtData.findOne({
    where: {
      paymentRequestId
    }
  })

  if (updatedDebtData) {
    await updateQualityChecksStatus(paymentRequestId, 'Passed')
    return
  }

  const paymentRequest = await db.paymentRequest.findOne({
    where: {
      paymentRequestId
    }
  })

  const { frn, agreementNumber, value } = paymentRequest
  const transaction = await db.sequelize.transaction()
  const foundDebtData = await checkDebts(frn, agreementNumber, value, transaction)
  if (foundDebtData) {
    try {
      await attachDebtInformation(paymentRequestId, paymentRequest, transaction)
      await transaction.commit()
      await updateQualityChecksStatus(paymentRequestId, 'Passed')
      return
    } catch (error) {
      await transaction.rollback()
      throw (error)
    }
  }
  await updatePaymentRequestCategory(paymentRequestId, 1)
  await updateQualityChecksStatus(paymentRequestId, 'Awaiting Enrichment')
}
module.exports = updateManualLedgerWithDebtData
