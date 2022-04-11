const db = require('../data')
const { updateQualityChecksStatus } = require('../quality-check')
const { updatePaymentRequestCategory } = require('../payment-request')
const { checkDebts, attachDebtInformation } = require('../debt')
const { PASSED, AWAITING_ENRICHMENT } = require('../quality-check/statuses')

const updateManualLedgerWithDebtData = async (paymentRequestId) => {
  const updatedDebtData = await db.debtData.findOne({
    where: {
      paymentRequestId
    }
  })

  if (updatedDebtData) {
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  const paymentRequest = await db.paymentRequest.findOne({
    where: {
      paymentRequestId
    }
  })

  const { frn, agreementNumber, netValue } = paymentRequest
  const foundDebtData = await checkDebts(frn, agreementNumber, netValue)
  if (foundDebtData) {
    paymentRequest.value = paymentRequest.netValue
    await attachDebtInformation(paymentRequestId, paymentRequest)
    await updateQualityChecksStatus(paymentRequestId, PASSED)
    return
  }

  await updatePaymentRequestCategory(paymentRequestId, 1)
  await updateQualityChecksStatus(paymentRequestId, AWAITING_ENRICHMENT)
}
module.exports = updateManualLedgerWithDebtData
