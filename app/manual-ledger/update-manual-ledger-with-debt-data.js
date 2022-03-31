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
  const foundDebtData = await checkDebts(frn, agreementNumber, value)
  if (foundDebtData) {
    await attachDebtInformation(paymentRequestId, paymentRequest)
    await updateQualityChecksStatus(paymentRequestId, 'Passed')
    return
  }

  await updatePaymentRequestCategory(paymentRequestId, 1)
  await updateQualityChecksStatus(paymentRequestId, 'Awaiting Enrichment')
}
module.exports = updateManualLedgerWithDebtData
