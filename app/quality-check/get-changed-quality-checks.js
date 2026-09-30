const { manualLedgerPaymentRequest } = require('../database')

const getChangedQualityChecks = async (qualityChecks) => {
  await Promise.all(qualityChecks.map(async (qualityCheck) => {
    const dismissedLedgerAssignments = await manualLedgerPaymentRequest().where({
      paymentRequestId: qualityCheck.paymentRequest.paymentRequestId,
      active: false
    })
    qualityCheck.hasDismissed = dismissedLedgerAssignments.length > 0 ? 'Yes' : 'No'
  }))
  return qualityChecks
}

module.exports = getChangedQualityChecks
