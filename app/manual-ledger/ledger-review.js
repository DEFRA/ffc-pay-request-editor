const { getManualLedger, resetManualLedger, updateManualLedgerWithDebtData } = require('./index')
const { updateQualityChecksStatus } = require('../quality-check')
const { PASSED, FAILED, PENDING } = require('../quality-check/statuses')
const { sendManualLedgerReviewEvent } = require('../event')
const { getUser } = require('../auth')

const ledgerReview = async (request) => {
  const status = request.payload.status ? request.payload.status : PENDING
  const paymentRequestId = request.payload.paymentRequestId

  if (paymentRequestId) {
    const manualLedgerData = await getManualLedger(paymentRequestId)
    const user = getUser(request)

    if (manualLedgerData && manualLedgerData.manualLedgerChecks[0].createdById !== user.userId) {
      switch (status) {
        case PASSED:
          await updateManualLedgerWithDebtData(paymentRequestId, status)
          break
        case FAILED:
          await updateQualityChecksStatus(paymentRequestId, status)
          await resetManualLedger(paymentRequestId)
          break
        default:
          await updateQualityChecksStatus(paymentRequestId, status)
          break
      }
    }
    await sendManualLedgerReviewEvent(paymentRequestId, user, status)
  }
}

module.exports = { ledgerReview }
